import { db } from "@/lib/db";

// 1. PARA EL ALUMNO: Obtener un intento de examen específico
export async function getExamAttempt(attemptId: string, userId?: string) {
  try {
    const attempt = await db.examAttempt.findFirst({
      where: {
        id: attemptId,
        ...(userId ? { userId } : {}),
      },
      include: {
        exam: {
          include: {
            // 1. Preguntas Sueltas
            questions: {
              where: { groupId: null }, // Solo las que no tienen grupo
              orderBy: { order: 'asc' },
              include: {
                options: true,
              },
            },
            // 2. Grupos de Preguntas (Casos)
            questionGroups: {
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                  include: { options: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
        },
        answers: true, // Traer respuestas previas si ya contestó algo
      },
    });
    return attempt;
  } catch {
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
  } catch {
    return [];
  }
}

// 3. PARA EL ADMIN: Obtener detalles de un examen (Título, etc.)
export async function getExamDetails(examId: string, ownerId?: string) {
  try {
    return await db.exam.findFirst({
      where: {
        id: examId,
        ...(ownerId ? { createdById: ownerId } : {}),
      },
    });
  } catch {
    return null;
  }
}

// 4. PARA EL ADMIN: Ver resultados de todos los alumnos en un examen
export async function getExamResults(examId: string, ownerId?: string) {
  try {
    if (ownerId) {
      const exam = await db.exam.findFirst({
        where: {
          id: examId,
          createdById: ownerId,
        },
        select: { id: true },
      });

      if (!exam) return [];
    }

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
  } catch {
    return [];
  }
}

// Modifica esta función para que reciba un userId
export async function getExamsByTeacher(userId: string) {
  try {
    return await db.exam.findMany({
      where: {
        createdById: userId // <--- EL FILTRO MÁGICO
      },
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { attempts: true }
        }
      }
    });
  } catch {
    return [];
  }
}
