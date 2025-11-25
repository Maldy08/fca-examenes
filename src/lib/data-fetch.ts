import { db } from "@/lib/db";

// 1. PARA EL ALUMNO: Obtener un intento de examen específico
export async function getExamAttempt(attemptId: string) {
  try {
    const attempt = await db.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: 'asc' }, // Ordenar preguntas
              include: {
                options: true, // Traer las opciones si es multiple choice
              },
            },
          },
        },
        answers: true, // Traer respuestas previas si ya contestó algo
      },
    });
    return attempt;
  } catch (error) {
    return null;
  }
}

// 2. PARA EL ADMIN: Obtener lista de todos los exámenes (Dashboard)
export async function getAllExams() {
  try {
    return await db.exam.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { attempts: true }
        }
      }
    });
  } catch (error) {
    return [];
  }
}

// 3. PARA EL ADMIN: Obtener detalles de un examen (Título, etc.)
export async function getExamDetails(examId: string) {
  try {
    return await db.exam.findUnique({
      where: { id: examId }
    });
  } catch (error) {
    return null;
  }
}

// 4. PARA EL ADMIN: Ver resultados de todos los alumnos en un examen
export async function getExamResults(examId: string) {
  try {
    const results = await db.examAttempt.findMany({
      where: { examId: examId },
      include: {
        user: true, // Para ver el nombre del alumno
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
    return results;
  } catch (error) {
    return [];
  }
}