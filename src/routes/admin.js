const express = require("express");
const prisma   = require("../lib/prisma");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

// ── SSE: real-time pending badge ─────────────────────────────────────
const sseClients = new Set();

function broadcastPendingCount(pendingCount) {
  const data = `data: ${JSON.stringify({ pendingCount })}\n\n`;
  for (const res of sseClients) {
    try { res.write(data); } catch { sseClients.delete(res); }
  }
}

// ── GET /api/admin/stats-summary — unified single source of truth ────
router.get("/stats-summary", async (req, res, next) => {
  try {
    const [fundingAgg, totalProjects, uniqueBackers, pendingCount] = await Promise.all([
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.donation.groupBy({ by: ["userId"] }),
      prisma.project.count({ where: { status: "PENDING" } }),
    ]);

    res.json({
      totalFunding:  fundingAgg._sum.amount ?? 0,
      totalProjects,
      totalBackers:  uniqueBackers.length,
      pendingCount,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/overview ──────────────────────────────────────────
router.get("/overview", async (req, res, next) => {
  try {
    const [
      totalProjects, pendingCount, activeCount, rejectedCount,
      totalUsers, aggregates, recentProjects, recentUsers, recentPending,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "PENDING" } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "REJECTED" } }),
      prisma.user.count(),
      prisma.donation.aggregate({ _sum: { amount: true }, _count: { id: true } }),
      prisma.project.findMany({
        take: 8, orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, slug: true, category: true,
          goal: true, raised: true, status: true, coverImage: true,
          createdAt: true, endsAt: true,
          creator: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        take: 5, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.project.findMany({
        where: { status: "PENDING" }, take: 5, orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true, creator: { select: { name: true } } },
      }),
    ]);

    const activity = [
      ...recentUsers.map(u => ({
        type: "user_signup",
        id: u.id, label: u.name,
        detail: "Шинэ хэрэглэгч бүртгүүллээ",
        time: u.createdAt,
      })),
      ...recentPending.map(p => ({
        type: "project_pending",
        id: p.id, label: p.title,
        detail: `${p.creator.name} — батлах хүсэлт илгээлээ`,
        time: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json({
      stats: {
        totalProjects, pendingCount, activeCount, rejectedCount,
        totalUsers,
        totalRaised:  aggregates._sum.amount ?? 0,
        totalBackers: aggregates._count.id,
      },
      recentProjects,
      activity,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/stats (lightweight — for AdminBar badge) ──────────
router.get("/stats", async (req, res, next) => {
  try {
    const pendingCount = await prisma.project.count({ where: { status: "PENDING" } });
    res.json({ pendingCount });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/projects ──────────────────────────────────────────
router.get("/projects", async (req, res, next) => {
  try {
    const { status = "all", page = "1", q } = req.query;
    const PAGE_SIZE = 20;
    const skip = (Number(page) - 1) * PAGE_SIZE;

    const where = {
      ...(status !== "all" && { status: status.toUpperCase() }),
      ...(q && {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where, skip, take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, name: true, email: true, phone: true, isVerified: true } },
          _count:  { select: { donations: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/projects/:id/approve ─────────────────────────────
router.post("/projects/:id/approve", async (req, res, next) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data:  { status: "ACTIVE", isPublished: true, rejectionReason: null },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count:  { select: { donations: true } },
      },
    });

    const pendingCount = await prisma.project.count({ where: { status: "PENDING" } });
    broadcastPendingCount(pendingCount);

    res.json({ project, pendingCount });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/projects/:id/reject ──────────────────────────────
router.post("/projects/:id/reject", async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data:  { status: "REJECTED", isPublished: false, rejectionReason: rejectionReason ?? null },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count:  { select: { donations: true } },
      },
    });

    const pendingCount = await prisma.project.count({ where: { status: "PENDING" } });
    broadcastPendingCount(pendingCount);

    res.json({ project, pendingCount });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/admin/projects/:id ────────────────────────────────────
router.patch("/projects/:id", async (req, res, next) => {
  try {
    const { action, reason, title, description, goal, endsAt, category, location, isTrending, isFeatured, isVerified } = req.body;

    let data = {};

    if (action === "approve") {
      data = { status: "ACTIVE", isPublished: true, rejectionReason: null };
    } else if (action === "reject") {
      data = { status: "REJECTED", isPublished: false, rejectionReason: reason ?? null };
    } else {
      if (title !== undefined)       data.title       = title;
      if (description !== undefined) data.description = description;
      if (goal !== undefined)        data.goal        = Number(goal);
      if (endsAt !== undefined)      data.endsAt      = new Date(endsAt);
      if (category !== undefined)    data.category    = category;
      if (location !== undefined)    data.location    = location;
      if (isTrending !== undefined)  data.isTrending  = isTrending;
      if (isFeatured !== undefined)  data.isFeatured  = isFeatured;
      if (isVerified !== undefined)  data.isVerified  = isVerified;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true, phone: true, isVerified: true } },
        _count:  { select: { donations: true } },
      },
    });

    if (action === "approve" || action === "reject") {
      const pendingCount = await prisma.project.count({ where: { status: "PENDING" } });
      broadcastPendingCount(pendingCount);
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/projects/:id ───────────────────────────────────
router.delete("/projects/:id", async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/users ─────────────────────────────────────────────
router.get("/users", async (req, res, next) => {
  try {
    const { page = "1", q } = req.query;
    const PAGE_SIZE = 30;
    const skip = (Number(page) - 1) * PAGE_SIZE;

    const where = q
      ? {
          OR: [
            { name:  { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, avatar: true, isVerified: true, createdAt: true,
          _count: { select: { projects: true, donations: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/admin/users/:id ───────────────────────────────────────
router.patch("/users/:id", async (req, res, next) => {
  try {
    const { role, isVerified } = req.body;
    const data = {};
    if (role !== undefined)       data.role       = role;
    if (isVerified !== undefined) data.isVerified = isVerified;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, avatar: true, isVerified: true, createdAt: true,
        _count: { select: { projects: true, donations: true } },
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/events — SSE for real-time navbar badge ───────────
router.get("/events", (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  sseClients.add(res);
  res.write(": connected\n\n");

  const heartbeat = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

module.exports = router;
