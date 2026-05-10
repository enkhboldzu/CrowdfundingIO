const express  = require("express");
const prisma    = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const PUBLIC_PROJECT_SELECT = {
  id: true, title: true, slug: true, description: true,
  category: true, goal: true, raised: true, backers: true,
  location: true, status: true, isVerified: true, isTrending: true,
  isFeatured: true, coverImage: true, endsAt: true, createdAt: true,
  creator: { select: { id: true, name: true, avatar: true, isVerified: true } },
  _count: { select: { donations: true } },
};

// GET /api/projects — list active projects
router.get("/", async (req, res, next) => {
  try {
    const { category, q, sort = "newest", page = "1", limit = "12" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      status: "ACTIVE",
      ...(category && { category }),
      ...(q && {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy =
      sort === "trending"  ? [{ isTrending: "desc" }, { raised: "desc" }] :
      sort === "mostfunded"? { raised: "desc" } :
      sort === "ending"    ? { endsAt: "asc" } :
      { createdAt: "desc" };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({ where, orderBy, skip, take: Number(limit), select: PUBLIC_PROJECT_SELECT }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/featured
router.get("/featured", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      orderBy: { raised: "desc" },
      take: 6,
      select: PUBLIC_PROJECT_SELECT,
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: {
        creator:     { select: { id: true, name: true, avatar: true, isVerified: true } },
        rewardTiers: { orderBy: { amount: "asc" } },
        updates:     { orderBy: { createdAt: "desc" } },
        _count:      { select: { donations: true } },
      },
    });

    if (!project || (project.status !== "ACTIVE" && project.status !== "FUNDED")) {
      return res.status(404).json({ error: "Төсөл олдсонгүй" });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects — create (auth required)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { title, description, category, goal, location, endsAt, coverImage } = req.body;
    if (!title || !description || !category || !goal || !endsAt) {
      return res.status(400).json({ error: "Заавал бөглөх талбарууд дутуу байна" });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9Ѐ-ӿ]+/gi, "-")
      .replace(/^-|-$/g, "") +
      "-" + Date.now();

    const project = await prisma.project.create({
      data: {
        title, slug, description, category,
        goal: Number(goal), location: location ?? "",
        endsAt: new Date(endsAt),
        coverImage: coverImage ?? null,
        creatorId: req.user.id,
      },
      select: PUBLIC_PROJECT_SELECT,
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:slug/donate — back a project
router.post("/:slug/donate", authenticate, async (req, res, next) => {
  try {
    const { amount, rewardTierId } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Хандивын дүн буруу байна" });
    }

    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project || project.status !== "ACTIVE") {
      return res.status(404).json({ error: "Төсөл олдсонгүй эсвэл идэвхгүй байна" });
    }

    const [donation] = await prisma.$transaction([
      prisma.donation.create({
        data: {
          amount: Number(amount),
          projectId: project.id,
          userId: req.user.id,
          rewardTierId: rewardTierId ?? null,
        },
      }),
      prisma.project.update({
        where: { id: project.id },
        data: {
          raised:  { increment: Number(amount) },
          backers: { increment: 1 },
        },
      }),
      ...(rewardTierId ? [
        prisma.rewardTier.update({
          where: { id: rewardTierId },
          data: { backerCount: { increment: 1 }, remaining: { decrement: 1 } },
        }),
      ] : []),
    ]);

    res.status(201).json({ donation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
