/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const Module = require("module");
const path = require("path");
const ts = require("typescript");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const ADMIN_LOGIN_NAME = "admin_b9eKNp5r";
const ADMIN_PASSWORD = "JYPBFpTHmtUwXyTx";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function loadMockData() {
  const filePath = path.join(__dirname, "..", "src", "lib", "mock-data.ts");
  const source = fs.readFileSync(filePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const mockModule = new Module(filePath, module);
  mockModule.filename = filePath;
  mockModule.paths = Module._nodeModulePaths(path.dirname(filePath));
  mockModule._compile(compiled, filePath);

  return mockModule.exports;
}

function endDate(daysLeft) {
  const days = Number.isFinite(daysLeft) ? Math.max(daysLeft, 1) : 30;
  return new Date(Date.now() + days * 86_400_000);
}

function seedId(prefix, slug, id) {
  return `${prefix}-${slug}-${id}`;
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));
loadEnvFile(path.join(__dirname, "..", ".env"));

const prisma = new PrismaClient();
const { MOCK_PROJECTS, MOCK_REWARD_TIERS, MOCK_UPDATES } = loadMockData();

async function main() {
  const baseCreatedAt = new Date("2026-05-07T00:00:00.000Z");
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { phone: ADMIN_LOGIN_NAME },
    update: {
      name: ADMIN_LOGIN_NAME,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      name: ADMIN_LOGIN_NAME,
      phone: ADMIN_LOGIN_NAME,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  for (const [index, project] of MOCK_PROJECTS.entries()) {
    const creator = await prisma.user.upsert({
      where: { id: project.creator.id },
      update: {
        name: project.creator.name,
        avatar: project.creator.avatar,
        isVerified: project.creator.isVerified,
      },
      create: {
        id: project.creator.id,
        name: project.creator.name,
        email: `${project.creator.id}@demo.crowdfund.mn`,
        passwordHash: "demo-seed-user",
        avatar: project.creator.avatar,
        isVerified: project.creator.isVerified,
      },
    });

    const createdAt = new Date(baseCreatedAt.getTime() - index * 60_000);
    const savedProject = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        description: project.description,
        story: project.description,
        category: project.category,
        coverImage: project.coverImage,
        goal: project.goal,
        raised: project.raised,
        backers: project.backers,
        location: "Mongolia",
        bankName: "Demo Bank",
        bankAccount: "0000000000",
        bankAccountName: creator.name,
        endsAt: endDate(project.daysLeft),
        status: "ACTIVE",
        isVerified: project.isVerified,
        isTrending: project.isTrending ?? false,
        isFeatured: project.isFeatured ?? false,
        tags: project.tags ?? [],
        creatorId: creator.id,
        createdAt,
      },
      create: {
        id: `seed-${project.slug}`,
        title: project.title,
        slug: project.slug,
        description: project.description,
        story: project.description,
        category: project.category,
        coverImage: project.coverImage,
        goal: project.goal,
        raised: project.raised,
        backers: project.backers,
        location: "Mongolia",
        bankName: "Demo Bank",
        bankAccount: "0000000000",
        bankAccountName: creator.name,
        endsAt: endDate(project.daysLeft),
        status: "ACTIVE",
        isVerified: project.isVerified,
        isTrending: project.isTrending ?? false,
        isFeatured: project.isFeatured ?? false,
        tags: project.tags ?? [],
        creatorId: creator.id,
        createdAt,
      },
    });

    for (const reward of MOCK_REWARD_TIERS[project.slug] ?? []) {
      await prisma.rewardTier.upsert({
        where: { id: seedId("reward", project.slug, reward.id) },
        update: {
          title: reward.title,
          amount: reward.amount,
          description: reward.description,
          backerCount: reward.backerCount,
          estimatedDelivery: reward.estimatedDelivery,
          isLimited: reward.isLimited,
          remaining: reward.remaining ?? null,
          projectId: savedProject.id,
        },
        create: {
          id: seedId("reward", project.slug, reward.id),
          title: reward.title,
          amount: reward.amount,
          description: reward.description,
          backerCount: reward.backerCount,
          estimatedDelivery: reward.estimatedDelivery,
          isLimited: reward.isLimited,
          remaining: reward.remaining ?? null,
          projectId: savedProject.id,
        },
      });
    }

    for (const update of MOCK_UPDATES[project.slug] ?? []) {
      await prisma.fundingUpdate.upsert({
        where: { id: seedId("update", project.slug, update.id) },
        update: {
          title: update.title,
          content: update.content,
          projectId: savedProject.id,
          createdAt: new Date(update.createdAt),
        },
        create: {
          id: seedId("update", project.slug, update.id),
          title: update.title,
          content: update.content,
          projectId: savedProject.id,
          createdAt: new Date(update.createdAt),
        },
      });
    }
  }

  const activeCount = await prisma.project.count({ where: { status: "ACTIVE" } });
  console.log(`Seeded ${MOCK_PROJECTS.length} demo projects. Active projects: ${activeCount}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
