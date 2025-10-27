import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// POST /api/domain-subject
export const POST = async (req: NextRequest) => {
  try {
    const { domainId, subjectId } = await req.json();

    if (!domainId || !subjectId) {
      return NextResponse.json(
        { error: "domainId e subjectId são obrigatórios" },
        { status: 400 }
      );
    }

    const link = await prisma.domainSubject.create({
      data: { domainId, subjectId },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Relação já existe (domainId + subjectId)" },
        { status: 409 }
      );
    }

    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    const list = await prisma.domainSubject.findMany({
      include: {
        domain: true,
        subject: true,
      },
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
};

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");
    const subjectId = searchParams.get("subjectId");

    if (!domainId || !subjectId) {
      return NextResponse.json(
        { error: "Parâmetros domainId e subjectId são obrigatórios." },
        { status: 400 }
      );
    }

    await prisma.domainSubject.delete({
      where: {
        domainId_subjectId: { domainId, subjectId },
      },
    });

    return NextResponse.json(
      { message: "Associação Domain-Subject removida com sucesso." },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Erro ao deletar associação:", error);
    return NextResponse.json(
      { error: "Erro interno ao tentar remover associação." },
      { status: 500 }
    );
  }
}