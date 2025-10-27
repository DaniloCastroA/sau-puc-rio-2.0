import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
export const POST = async (req: NextRequest) => {
  const data = await req.json();

  if (!data.subjects || !Array.isArray(data.subjects) || data.subjects.length === 0) {
    return NextResponse.json({ error: "subjects are required" }, { status: 400 });
  }

  try {
    const created = await prisma.domain.create({
      data: {
        name: data.name,
        description: data.description || null,
        subjects: {
          create: data.subjects.map((subjectId: string) => ({
            subject: { connect: { id: subjectId } }
          }))
        }
      },
      include: { subjects: true } 
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id"); // pega da query string
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const item = await prisma.domain.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(item);
};


export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    await prisma.domain.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
};