"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuestionType } from "@prisma/client";

// 1. Crear el Examen (Solo cabecera)
export async function createExamAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const accessCode = formData.get("accessCode") as string;

  // OJO: Aquí deberíamos sacar el ID del usuario logueado real.
  // Por ahora, buscamos a tu usuario admin "hardcodeado" o creamos uno temporal
  // En un futuro integrarás Auth real (Clerk/NextAuth)
  const user = await db.user.findFirst({ where: { role: "ADMIN" } });

  if (!user) throw new Error("No hay usuario Admin para asignar el examen");

  const exam = await db.exam.create({
    data: {
      title,
      description,
      accessCode,
      createdById: user.id,
      isActive: false, // Nace como borrador
    },
  });

  redirect(`/exams/${exam.id}/edit`); // Nos lleva directo a agregar preguntas
}

// 2. Agregar una Pregunta al Examen
export async function addQuestionAction(
  examId: string,
  type: QuestionType,
  content: string,
  points: number,
  optionsData?: { text: string, isCorrect: boolean }[]
) {

  await db.question.create({
    data: {
      examId,
      content,
      type,
      points,
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
