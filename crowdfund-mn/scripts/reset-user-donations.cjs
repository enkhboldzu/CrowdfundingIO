/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadEnvFile(filename) {
  const file = path.join(process.cwd(), filename);
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const target = process.argv.slice(2).find(arg => !arg.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");

if (!target) {
  console.error("Usage: node scripts/reset-user-donations.cjs <user-email-or-id> [--dry-run]");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: target },
        { email: target },
        { phone: target },
      ],
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  if (!user) {
    console.log(`User not found: ${target}`);
    return;
  }

  const donations = await prisma.donation.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    select: {
      id: true,
      amount: true,
      projectId: true,
      rewardTierId: true,
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (donations.length === 0) {
    console.log(`${user.name} has no completed donations. Nothing to reset.`);
    return;
  }

  const total = donations.reduce((sum, donation) => sum + donation.amount, 0);

  console.log(`User: ${user.name} (${user.email ?? user.phone ?? user.id})`);
  console.log(`Completed donations: ${donations.length}`);
  console.log(`Total to reset: ${total.toLocaleString("mn-MN")}₮`);
  for (const donation of donations) {
    console.log(`- ${donation.project.title}: ${donation.amount.toLocaleString("mn-MN")}₮`);
  }

  if (dryRun) {
    console.log("Dry run only. No database changes were made.");
    return;
  }

  await prisma.$transaction(async tx => {
    for (const donation of donations) {
      await tx.donation.update({
        where: { id: donation.id },
        data: {
          amount: 0,
          status: "REFUNDED",
        },
      });

      await tx.$executeRaw`
        UPDATE "Project"
        SET
          "raised" = GREATEST(0, "raised" - ${donation.amount}),
          "backers" = GREATEST(0, "backers" - 1)
        WHERE "id" = ${donation.projectId}
      `;

      if (donation.rewardTierId) {
        await tx.$executeRaw`
          UPDATE "RewardTier"
          SET
            "backerCount" = GREATEST(0, "backerCount" - 1),
            "remaining" = CASE
              WHEN "remaining" IS NULL THEN NULL
              ELSE "remaining" + 1
            END
          WHERE "id" = ${donation.rewardTierId}
        `;
      }
    }
  });

  console.log("Done. This user's completed support total is now 0₮.");
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
