const express = require("express");
const bcrypt  = require("bcryptjs");
const prisma  = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me/projects
router.get("/me/projects", authenticate, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { creatorId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, category: true,
        goal: true, raised: true, backers: true, status: true,
        coverImage: true, endsAt: true, createdAt: true,
      },
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me/donations
router.get("/me/donations", authenticate, async (req, res, next) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, title: true, slug: true, coverImage: true } },
        rewardTier: { select: { title: true, amount: true } },
      },
    });
    res.json({ donations });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — update profile
router.patch("/me", authenticate, async (req, res, next) => {
  try {
    const { name, avatar, password } = req.body;
    const data = {};
    if (name)     data.name = name;
    if (avatar)   data.avatar = avatar;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
