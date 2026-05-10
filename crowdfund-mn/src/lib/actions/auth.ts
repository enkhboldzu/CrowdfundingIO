"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, verifyToken } from "@/lib/session";

const SESSION_COOKIE = "cfmn_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function isEmail(value: string) {
  return value.includes("@");
}

/* ── Register ──────────────────────────────────────────────────────── */

export async function registerUser(data: {
  name: string;
  identifier: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const emailField = isEmail(data.identifier);

    const existing = await prisma.user.findFirst({
      where: emailField
        ? { email: data.identifier }
        : { phone: data.identifier },
    });

    if (existing) {
      return { success: false, error: "Энэ имэйл эсвэл утасны дугаар бүртгэлтэй байна." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        name: data.name,
        email: emailField ? data.identifier : null,
        phone: emailField ? null : data.identifier,
        passwordHash,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Бүртгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }
}

/* ── Login ─────────────────────────────────────────────────────────── */

export async function loginUser(data: {
  identifier: string;
  password: string;
  role?: "user" | "admin";
}): Promise<{ success: boolean; error?: string; role?: "user" | "admin"; name?: string }> {
  try {
    const emailField = isEmail(data.identifier);

    const user = await prisma.user.findFirst({
      where: emailField
        ? { email: data.identifier }
        : { phone: data.identifier },
    });

    if (!user) {
      return { success: false, error: "Имэйл эсвэл нууц үг буруу байна." };
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Имэйл эсвэл нууц үг буруу байна." };
    }

    const dbRole = user.role === "ADMIN" ? "admin" : "user";
    if (data.role === "admin" && dbRole !== "admin") {
      return { success: false, error: "Танд админ эрх байхгүй байна." };
    }

    const token = await createToken({ userId: user.id, role: dbRole, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return { success: true, role: dbRole, name: user.name };
  } catch {
    return { success: false, error: "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }
}

/* ── Logout ────────────────────────────────────────────────────────── */

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/* ── Get Session ───────────────────────────────────────────────────── */

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
