"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function joinExamAction(formData: FormData) {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const code = formData.get("code") as string;

  // 1. Buscar el examen por el código
  const exam = await db.exam.findUnique({
    where: { accessCode: code },
  });

  if (!exam) {
    return { error: "Código de examen inválido." };
  }

  if (!exam.isActive) {
    return { error: "Este examen aún no está activo." };
  }

  // 2. Buscar o Crear al Estudiante
  // (Upsert: Si existe lo actualiza, si no, lo crea)
  const student = await db.user.upsert({
    where: { email },
    update: { name: fullName }, // Actualizamos el nombre por si lo corrigió
    create: {
      email,
      name: fullName,
      role: "STUDENT",
    },
  });

  // 3. Verificar si ya tiene un intento ABIERTO para este examen
  // (Para que si se le cierra el navegador, pueda volver a entrar)
  const existingAttempt = await db.examAttempt.findFirst({
    where: {
      userId: student.id,
      examId: exam.id,
      status: "in_progress", // Asumiendo que usas "in_progress"
    },
  });

  if (existingAttempt) {
    redirect(`/take-exam/${existingAttempt.id}`);
  }

  // 4. Verificar si ya lo terminó (Para no dejarlo hacerlo dos veces)
  const completedAttempt = await db.examAttempt.findFirst({
    where: {
        userId: student.id,
        examId: exam.id,
        status: "completed",
    }
  });

if (completedAttempt) {
      // --- CAMBIO AQUÍ ---
      // Antes: return { error: "Ya has completado este examen." };
      // Ahora: Lo redirigimos a su boleta de resultados
     redirect(`/boleta/${completedAttempt.id}`);
  }

  // 5. Crear nuevo intento
  const newAttempt = await db.examAttempt.create({
    data: {
      userId: student.id,
      examId: exam.id,
      startedAt: new Date(),
      status: "in_progress"
    },
  });

  redirect(`/take-exam/${newAttempt.id}`);
}