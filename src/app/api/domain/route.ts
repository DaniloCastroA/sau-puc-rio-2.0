import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const item = await prisma.domain.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
};

export const POST = async (req: NextRequest) => {
  const data = await req.json();

  try {
    const created = await prisma.domain.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002")
      return NextResponse.json({ error: "name already exists" }, { status: 409 });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const data = await req.json();
  try {
    const updated = await prisma.domain.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "not found" }, { status: 404 });
    if (err?.code === "P2002") return NextResponse.json({ error: "name already exists" }, { status: 409 });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
};

export const DELETE = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.domain.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
};