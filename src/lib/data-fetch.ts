// lib/data-fetch.ts

import { db } from "./db";

// ... (tu código anterior)

export async function getExamResults(examId: string) {
  const results = await db.examAttempt.findMany({
    where: { examId: examId },
    include: {
      user: true, // Para ver el nombre del alumno
    },
    orderBy: {
      startedAt: 'desc' // Los más recientes primero
    }
  });
  return results;
}

export async function getExamDetails(examId: string) {
  return await db.exam.findUnique({
    where: { id: examId }
  });
}

export async function getAllExams() {
  return await db.exam.findMany({
    orderBy: { title: 'asc' },
    include: {
      _count: {
        select: { attempts: true } // Truco de Prisma: Cuenta cuántos alumnos lo han intentado
      }
    }
  });
}