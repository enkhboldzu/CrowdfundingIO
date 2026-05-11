import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/api-auth";
import {
  ACCEPTED_IMAGE_TYPE_SET,
  IMAGE_EXTENSION_BY_TYPE,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/upload";

export async function POST(req: NextRequest) {
  // Must be a logged-in user (any role)
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: globalThis.FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ACCEPTED_IMAGE_TYPE_SET.has(file.type)) {
    return NextResponse.json(
      { error: "Зөвхөн PNG, JPG, WEBP файл зөвшөөрнө" },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Файлын хэмжээ ${MAX_IMAGE_UPLOAD_MB} MB-аас хэтрэхгүй байх ёстой` },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a collision-resistant filename
    const ext      = IMAGE_EXTENSION_BY_TYPE[file.type] ?? "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    // Return the public URL path (served by Next.js static file handler)
    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

/*
 * ── Cloudinary upgrade path ──────────────────────────────────────────────────
 *
 * To switch from local storage to Cloudinary:
 *   1. npm install cloudinary
 *   2. Add to .env.local:
 *        CLOUDINARY_CLOUD_NAME=your_cloud_name
 *        CLOUDINARY_API_KEY=your_api_key
 *        CLOUDINARY_API_SECRET=your_api_secret
 *   3. Replace the try-block above with:
 *
 *   import { v2 as cloudinary } from "cloudinary";
 *   cloudinary.config({
 *     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *     api_key:    process.env.CLOUDINARY_API_KEY,
 *     api_secret: process.env.CLOUDINARY_API_SECRET,
 *   });
 *
 *   const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
 *   const dataUri = `data:${file.type};base64,${b64}`;
 *   const result = await cloudinary.uploader.upload(dataUri, {
 *     folder: "crowdfund-mn",
 *     resource_type: "image",
 *     transformation: [{ width: 1280, height: 720, crop: "fill", quality: "auto" }],
 *   });
 *   return NextResponse.json({ url: result.secure_url });
 *
 *   4. Add to next.config.js remotePatterns:
 *        { protocol: "https", hostname: "res.cloudinary.com" }
 */
