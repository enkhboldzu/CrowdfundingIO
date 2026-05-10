require("dotenv").config();

const app    = require("./app");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT ?? 4000;

async function main() {
  await prisma.$connect();
  console.log("✓ Database connected");

  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`);
  });
}

main().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
