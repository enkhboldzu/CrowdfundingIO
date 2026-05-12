import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/api-auth";
import { uploadedDocumentUrl } from "@/lib/document-src";
import {
  ACCEPTED_DOCUMENT_TYPE_SET,
  DOCUMENT_EXTENSION_BY_TYPE,
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_DOCUMENT_UPLOAD_MB,
} from "@/lib/upload";

function storageErrorMessage(err: unknown) {
  const code = typeof err === "object" && err && "code" in err
    ? String((err as NodeJS.ErrnoException).code)
    : "";

  if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
    return "Server дээр баримт хадгалах эрх алга. public/uploads folder-ийн permission шалгана уу.";
  }

  if (code === "ENOSPC") {
    return "Server-ийн disk дүүрсэн байна.";
  }

  return "Upload failed";
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });
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

  if (!ACCEPTED_DOCUMENT_TYPE_SET.has(file.type)) {
    return NextResponse.json(
      { error: "PDF, DOC, DOCX, PNG, JPG, WEBP баримт оруулна уу." },
      { status: 400 }
    );
  }

  if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Файлын хэмжээ ${MAX_DOCUMENT_UPLOAD_MB} MB-аас хэтрэхгүй байх ёстой` },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = DOCUMENT_EXTENSION_BY_TYPE[file.type] ?? "pdf";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({
      url: uploadedDocumentUrl(safeName),
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    console.error("[POST /api/upload/document]", err);
    return NextResponse.json({ error: storageErrorMessage(err) }, { status: 500 });
  }
}
