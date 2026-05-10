import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

interface Params { params: { id: string } }

/* ── GET — full project detail for admin review ─────────────────── */
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true, name: true, email: true, phone: true,
            isVerified: true, createdAt: true,
            _count: { select: { projects: true } },
          },
        },
        rewards: { orderBy: { amount: "asc" } },
        _count:  { select: { donations: true } },
      },
    });

    if (!project || project.isDeleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[/api/admin/projects/[id] GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── PATCH — approve/reject OR content edit ─────────────────────── */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    // Workflow actions
    action?: "approve" | "reject";
    reason?: string;
    // Content edits (any subset)
    title?:       string;
    description?: string;
    story?:       string;
    goal?:        number;
    endsAt?:      string;
    category?:    string;
    location?:    string;
    isTrending?:  boolean;
    isFeatured?:  boolean;
    isVerified?:  boolean;
  };

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, creatorId: true, status: true, isDeleted: true },
  });

  if (!project || project.isDeleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // ── Workflow: approve / reject ───────────────────────────────────
  if (body.action === "approve" || body.action === "reject") {
    if (project.status !== "PENDING") {
      return NextResponse.json({ error: "Project is no longer pending" }, { status: 409 });
    }

    const isApprove = body.action === "approve";

    const [updated] = await prisma.$transaction([
      prisma.project.update({
        where: { id: project.id },
        data: {
          status:          isApprove ? "ACTIVE"   : "REJECTED",
          publishedAt:     isApprove ? new Date()  : null,
          rejectionReason: isApprove ? null        : (body.reason ?? null),
        },
      }),
      prisma.notification.create({
        data: {
          userId:           project.creatorId,
          type:             isApprove ? "PROJECT_APPROVED" : "PROJECT_REJECTED",
          title:            isApprove ? "Таны төсөл батлагдлаа!" : "Төсөл татгалзагдлаа",
          message:          isApprove
            ? `"${project.title}" төсөл шалгагдан амжилттай нийтлэгдлээ.`
            : `"${project.title}" төсөл татгалзагдлаа.${body.reason ? ` Шалтгаан: ${body.reason}` : ""}`,
          relatedProjectId: project.id,
        },
      }),
    ]);

    revalidatePublicProjectPages(updated.slug);

    return NextResponse.json({ project: updated });
  }

  // ── Content edit (God-mode) ──────────────────────────────────────
  const editData: Record<string, unknown> = {};
  if (body.title       !== undefined) editData.title       = body.title;
  if (body.description !== undefined) editData.description = body.description;
  if (body.story       !== undefined) editData.story       = body.story;
  if (body.goal        !== undefined) editData.goal        = Number(body.goal);
  if (body.endsAt      !== undefined) editData.endsAt      = new Date(body.endsAt);
  if (body.category    !== undefined) editData.category    = body.category;
  if (body.location    !== undefined) editData.location    = body.location;
  if (body.isTrending  !== undefined) editData.isTrending  = body.isTrending;
  if (body.isFeatured  !== undefined) editData.isFeatured  = body.isFeatured;
  if (body.isVerified  !== undefined) editData.isVerified  = body.isVerified;

  if (Object.keys(editData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data:  editData,
  });

  revalidatePublicProjectPages(updated.slug);

  return NextResponse.json({ project: updated });
}

/* ── DELETE — soft delete ───────────────────────────────────────── */
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, isDeleted: true },
  });

  if (!project || project.isDeleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.update({
    where: { id: params.id },
    data:  { isDeleted: true },
  });

  revalidatePublicProjectPages(project.slug);

  return NextResponse.json({ ok: true });
}

function revalidatePublicProjectPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/projects/${slug}`);
}
