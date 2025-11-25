"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAnswerScoreAction(
  answerId: string,
  newPoints: number,
  attemptId: string,
  examId: string
) {
  try {
    // 1. Actualizar el puntaje de esa respuesta específica
    await db.answer.update({
      where: { id: answerId },
      data: {
        pointsAwarded: newPoints,
        isCorrect: newPoints > 0, // Asumimos que si tiene puntos, es correcta/parcial
      },
    });

    // 2. Recalcular el TOTAL del examen
    // Sumamos todos los puntos de todas las respuestas de ese intento
    const allAnswers = await db.answer.findMany({
      where: { attemptId: attemptId },
    });

    const totalScore = allAnswers.reduce((acc, ans) => acc + (ans.pointsAwarded || 0), 0);

    // 3. Actualizar el score final en el intento
    await db.examAttempt.update({
      where: { id: attemptId },
      data: { score: totalScore },
    });

    // 4. Refrescar la pantalla para que veas el cambio al instante
    revalidatePath(`/exams/${examId}/results/${attemptId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error actualizando calificación:", error);
    return { success: false };
  }
}