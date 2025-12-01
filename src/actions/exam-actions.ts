"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function createExamAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const accessCode = formData.get("accessCode") as string;
  const timeLimit = formData.get("timeLimit") as string;

  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;

  // Convertir a objetos Date o null si están vacíos
  const startTime = startTimeStr ? new Date(startTimeStr) : null;
  const endTime = endTimeStr ? new Date(endTimeStr) : null;
  
  
  // 1. OBTENER USUARIO ACTUAL DE CLERK
  const clerkUser = await currentUser();
  
  if (!clerkUser || !clerkUser.emailAddresses[0]) {
      throw new Error("No autorizado");
  }
  const email = clerkUser.emailAddresses[0].emailAddress;

  // 2. BUSCAR SU ID EN NUESTRA BASE DE DATOS
  const dbUser = await db.user.findUnique({
      where: { email: email }
  });

  if (!dbUser) throw new Error("Usuario no encontrado en base de datos");

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

  redirect(`/exams/${exam.id}/edit`);
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
  await db.exam.update({
    where: { id: examId },
    data: { isActive }
  });
  revalidatePath("/dashboard");
  revalidatePath(`/exams/${examId}/edit`);
}

export async function deleteQuestionAction(questionId: string, examId: string) {
  try {
    await db.question.delete({
      where: { id: questionId }
    });

    // Recargamos la página de edición para que desaparezca la pregunta de la lista
    revalidatePath(`/exams/${examId}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar la pregunta" };
  }
}

// --- NUEVAS ACCIONES PARA CASOS DE ESTUDIO ---

export async function createGroupAction(examId: string, title: string, content: string) {
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
    await db.questionGroup.delete({
      where: { id: groupId }
    });
    revalidatePath(`/exams/${examId}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el grupo" };
  }
}
