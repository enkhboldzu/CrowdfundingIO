import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

interface Params {
  params: { path?: string[] };
}

const CONTENT_TYPES: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
  pdf:  "application/pdf",
  doc:  "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: Params) {
  const segments = params.path ?? [];
  const filename = segments.join("/");

  if (!filename || segments.some(segment => !segment || segment.includes(".."))) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadDir, filename);
  const relative = path.relative(uploadDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];

  if (!contentType) {
    return NextResponse.json({ error: "Unsupported upload type" }, { status: 415 });
  }

  try {
    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }
}
