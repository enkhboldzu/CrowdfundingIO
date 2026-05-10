const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@crowdfund.mn" },
    update: {},
    create: {
      name: "Админ",
      email: "admin@crowdfund.mn",
      password: hash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // Demo user
  const userHash = await bcrypt.hash("user1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@crowdfund.mn" },
    update: {},
    create: {
      name: "Демо Хэрэглэгч",
      email: "demo@crowdfund.mn",
      password: userHash,
      isVerified: true,
    },
  });

  // Sample project
  await prisma.project.upsert({
    where: { slug: "mongol-startup-demo" },
    update: {},
    create: {
      title: "Монгол Стартап Демо",
      slug: "mongol-startup-demo",
      description: "Монгол улсын технологийн салбарт шинэ хуудас нээх стартап төсөл.",
      category: "technology",
      goal: 50_000_000,
      raised: 18_500_000,
      backers: 42,
      location: "Улаанбаатар",
      status: "ACTIVE",
      isVerified: true,
      isTrending: true,
      isFeatured: true,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      creatorId: user.id,
      rewardTiers: {
        create: [
          {
            title: "Дэмжигч",
            description: "Төслийг дэмжсэн хүмүүст баярлалаа гэсэн захидал.",
            amount: 10_000,
            estimatedDelivery: "2026-08",
            backerCount: 20,
          },
          {
            title: "Идэвхтэн",
            description: "Бета хувилбарт хандах эрх + нэрийн жагсаалтад нэмэгдэнэ.",
            amount: 50_000,
            isLimited: true,
            remaining: 8,
            estimatedDelivery: "2026-07",
            backerCount: 12,
          },
        ],
      },
      updates: {
        create: [
          {
            title: "Эхний шат амжилттай дууслаа!",
            content: "Бүтээгдэхүүний эхний шатны хөгжүүлэлт амжилттай дуусч, бета тест эхэллээ.",
          },
        ],
      },
    },
  });

  console.log("✓ Seed complete");
  console.log("  Admin:  admin@crowdfund.mn / admin1234");
  console.log("  User:   demo@crowdfund.mn  / user1234");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
