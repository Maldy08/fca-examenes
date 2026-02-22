"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { requireAdminUser } from "@/lib/auth";
import { errorResponse, successResponse, ActionResponse } from "@/lib/action-utils";
import { z } from "zod";

async function assertExamOwnership(examId: string, userId: string) {
  const exam = await db.exam.findUnique({
    where: { id: examId },
    select: { id: true, createdById: true },
  });

  if (!exam || exam.createdById !== userId) {
    throw new Error("No autorizado");
  }

  return exam;
}

const createExamSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  accessCode: z.string().min(3, "El código de acceso debe tener al menos 3 caracteres"),
  timeLimit: z.string().optional(),
  startTimeStr: z.string().optional(),
  endTimeStr: z.string().optional(),
});

export async function createExamAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<null>> {
  const result = createExamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    accessCode: formData.get("accessCode"),
    timeLimit: formData.get("timeLimit"),
    startTimeStr: formData.get("startTime"),
    endTimeStr: formData.get("endTime"),
  });

  if (!result.success) {
    return errorResponse(result.error.issues[0].message);
  }

  const { title, description, accessCode, timeLimit, startTimeStr, endTimeStr } = result.data;

  // Convertir a objetos Date o null si están vacíos
  const startTime = startTimeStr ? new Date(startTimeStr) : null;
  const endTime = endTimeStr ? new Date(endTimeStr) : null;

  const dbUser = await requireAdminUser();

  try {
    // 3. CREAR EL EXAMEN ASIGNADO A ÉL
    const exam = await db.exam.create({
      data: {
        title,
        description,
        accessCode,
        createdById: dbUser.id, // <--- AQUÍ ESTÁ LA CLAVE
        isActive: false,
        timeLimitMin: Number(timeLimit) > 0 ? Number(timeLimit) : null, // Guardar en BD
        startTime,
        endTime,
      },
    });

    // We have to use the exam.id, but since we are outside try-catch, we need to do it differently. Let's fix this below.
  } catch (error: any) {
    if (error.code === 'P2002') {
      return errorResponse("El código de acceso ya está en uso. Por favor elige otro.");
    }
    return errorResponse("Ocurrió un error al crear el examen.");
  }

  redirect(`/exams/${accessCode}/edit`);
}

// 2. Agregar una Pregunta al Examen
export async function addQuestionAction(
  examId: string,
  type: QuestionType,
  content: string,
  points: number,
  optionsData?: { text: string, isCorrect: boolean }[],
  groupId?: string, // <--- NUEVO PARAMETRO
  imageUrl?: string
) {
  const adminUser = await requireAdminUser();
  await assertExamOwnership(examId, adminUser.id);

  if (groupId) {
    const group = await db.questionGroup.findUnique({
      where: { id: groupId },
      select: { examId: true },
    });

    if (!group || group.examId !== examId) {
      throw new Error("Grupo inválido");
    }
  }

  await db.question.create({
    data: {
      examId,
      content,
      type,
      points,
      groupId, // <--- CONECTAR AL GRUPO SI EXISTE
      imageUrl,
      options: optionsData ? {
        create: optionsData
      } : undefined
    }
  });

  revalidatePath(`/exams/${examId}/edit`);
  return { success: true };
}

// 3. Activar/Publicar Examen
export async function toggleExamStatusAction(examId: string, isActive: boolean) {
  const adminUser = await requireAdminUser();
  await assertExamOwnership(examId, adminUser.id);

  await db.exam.update({
    where: { id: examId },
    data: { isActive }
  });
  revalidatePath("/dashboard");
  revalidatePath(`/exams/${examId}/edit`);
}

export async function deleteQuestionAction(questionId: string, examId: string) {
  try {
    const adminUser = await requireAdminUser();
    await assertExamOwnership(examId, adminUser.id);

    const question = await db.question.findUnique({
      where: { id: questionId },
      select: { examId: true },
    });

    if (!question || question.examId !== examId) {
      return { success: false, error: "Pregunta inválida para este examen" };
    }

    await db.question.delete({
      where: { id: questionId }
    });

    // Recargamos la página de edición para que desaparezca la pregunta de la lista
    revalidatePath(`/exams/${examId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo eliminar la pregunta" };
  }
}

// --- NUEVAS ACCIONES PARA CASOS DE ESTUDIO ---

export async function createGroupAction(examId: string, title: string, content: string) {
  const adminUser = await requireAdminUser();
  await assertExamOwnership(examId, adminUser.id);

  await db.questionGroup.create({
    data: {
      examId,
      title,
      content
    }
  });
  revalidatePath(`/exams/${examId}/edit`);
  return { success: true };
}

export async function deleteGroupAction(groupId: string, examId: string) {
  try {
    const adminUser = await requireAdminUser();
    await assertExamOwnership(examId, adminUser.id);

    const group = await db.questionGroup.findUnique({
      where: { id: groupId },
      select: { examId: true },
    });

    if (!group || group.examId !== examId) {
      return { success: false, error: "Grupo inválido para este examen" };
    }

    await db.questionGroup.delete({
      where: { id: groupId }
    });
    revalidatePath(`/exams/${examId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo eliminar el grupo" };
  }
}
