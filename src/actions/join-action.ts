"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setStudentSession } from "@/lib/student-session";
import { errorResponse, successResponse, ActionResponse } from "@/lib/action-utils";
import { z } from "zod";

const joinExamSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código del examen es requerido"),
});

export async function joinExamAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<null>> {
  const result = joinExamSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    code: formData.get("code"),
  });

  if (!result.success) {
    return errorResponse(result.error.issues[0].message);
  }

  const { email, fullName, code } = result.data;

  // 1. Buscar el examen por el código
  const exam = await db.exam.findUnique({
    where: { accessCode: code },
  });

  if (!exam) {
    return errorResponse("Código de examen inválido.");
  }

  if (!exam.isActive) {
    return errorResponse("Este examen aún no está activo.");
  }

  const now = new Date();


  // A) ¿Es muy temprano?
  if (exam.startTime && now < exam.startTime) {
    return errorResponse(`El examen comienza el ${exam.startTime.toLocaleString('es-MX')}.`);
  }

  // B) ¿Es muy tarde?
  if (exam.endTime && now > exam.endTime) {
    return errorResponse(`Este examen cerró el ${exam.endTime.toLocaleString('es-MX')}. Ya no puedes ingresar.`);
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
    await setStudentSession(student.id);
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
    await setStudentSession(student.id);
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

  await setStudentSession(student.id);
  redirect(`/take-exam/${newAttempt.id}`);
}
