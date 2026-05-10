const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const prisma  = require("../lib/prisma");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: "Нэр, нууц үг, имэйл эсвэл утас шаардлагатай" });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email ?? null, phone: phone ?? null, password: hash },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true },
    });

    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: "Нууц үг болон имэйл эсвэл утас шаардлагатай" });
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Нэвтрэх мэдээлэл буруу байна" });
    }

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
const { authenticate } = require("../middleware/auth");
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isVerified: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
