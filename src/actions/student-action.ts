"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveAnswerAction(
  attemptId: string,
  questionId: string,
  answerText: string
) {
  try {
    // 1. Buscamos si ya existe una respuesta para actualizarla, o creamos una nueva
    // Usamos UPSERT (Update + Insert)
    await db.answer.upsert({
      where: {
        attemptId_questionId: { // Este índice compuesto lo definimos en el schema
          attemptId,
          questionId,
        },
      },
      update: {
        textAnswer: answerText,
        // Si es opción múltiple, también guardamos el ID si el texto coincide con un ID
        // (Por simplicidad en este MVP guardamos todo en textAnswer, 
        // pero idealmente separaríamos IDs de texto real)
        selectedOptionId: isUUID(answerText) ? answerText : null, 
      },
      create: {
        attemptId,
        questionId,
        textAnswer: answerText,
        selectedOptionId: isUUID(answerText) ? answerText : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error guardando respuesta:", error);
    return { success: false };
  }
}


// ... (imports anteriores)

export async function finishExamAction(attemptId: string) {
  try {
    // 1. Traer el intento con las respuestas y las preguntas originales (para ver cuál era la correcta)
    const attempt = await db.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: { options: true } // Necesitamos las opciones para saber cuál es la correcta
            }
          }
        },
        answers: true
      }
    });

    if (!attempt) throw new Error("Intento no encontrado");

    // 2. CALIFICACIÓN AUTOMÁTICA (Solo Multiple Choice por ahora)
    let totalScore = 0;
    
    // Recorremos todas las preguntas del examen
    for (const question of attempt.exam.questions) {
      // Buscamos la respuesta del alumno para esta pregunta
      const answer = attempt.answers.find(a => a.questionId === question.id);

      if (question.type === 'MULTIPLE_CHOICE' && answer?.selectedOptionId) {
        // Buscamos si la opción seleccionada era la correcta
        const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
        
        if (selectedOption?.isCorrect) {
          totalScore += question.points; // Sumamos los puntos
          // Actualizamos la respuesta individual como correcta
          await db.answer.update({
            where: { id: answer.id },
            data: { isCorrect: true, pointsAwarded: question.points }
          });
        } else {
           // Marcar como incorrecta
           if(answer) {
             await db.answer.update({
                where: { id: answer.id },
                data: { isCorrect: false, pointsAwarded: 0 }
             });
           }
        }
      }
      // NOTA: Para CODE_SQL y OPEN_TEXT, la calificación queda pendiente (null) o 0 hasta revisión.
    }

    // 3. Cerrar el intento
    await db.examAttempt.update({
      where: { id: attemptId },
      data: {
        status :"completed",
        finishedAt: new Date(),
        score: totalScore // Guardamos la calificación preliminar
      }
    });

    // 4. Revalidar para que si intentan entrar de nuevo, les salga "Examen Terminado"
    revalidatePath(`/take-exam/${attemptId}`);
    
    return { success: true };

  } catch (error) {
    console.error("Error finalizando examen:", error);
    return { success: false };
  }
}
// Helper simple para saber si es un ID de opción múltiple
function isUUID(str: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}