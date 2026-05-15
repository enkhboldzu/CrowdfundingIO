"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "./auth";
import { normalizeImageSrc } from "@/lib/image-src";

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Нэвтрэх шаардлагатай." };

    const updates: Record<string, unknown> = {};

    if (data.name?.trim()) {
      updates.name = data.name.trim();
    }

    if (data.bio !== undefined) {
      updates.bio = data.bio.trim() || null;
    }

    if (data.avatar) {
      const avatar = normalizeImageSrc(data.avatar);
      if (avatar) updates.avatar = avatar;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, error: "Одоогийн нууц үгийг оруулна уу." };
      }
      if (data.newPassword.length < 8) {
        return { success: false, error: "Шинэ нууц үг 8-аас дээш тэмдэгттэй байх ёстой." };
      }
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { passwordHash: true },
      });
      if (!user) return { success: false, error: "Хэрэглэгч олдсонгүй." };

      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!valid) return { success: false, error: "Одоогийн нууц үг буруу байна." };

      updates.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({ where: { id: session.userId }, data: updates });
    }

    return { success: true };
  } catch {
    return { success: false, error: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу." };
  }
}
