
import ExamUI from "@/components/exam-taker/ExamUI";
import { getExamAttempt } from "@/lib/data-fetch";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function TakeExamPage({ params }: PageProps) {
  // 1. Esperamos a tener el ID de la URL
  const { attemptId } = await params;

  // 2. Obtenemos los datos REALES directamente de la BD (Server-side)
  // (Esta función ya trae las preguntas en mayúsculas MULTIPLE_CHOICE)
  const attempt = await getExamAttempt(attemptId);

  // 3. Si el intento no existe (URL inválida), mostramos 404
  if (!attempt) {
    return notFound();
  }

  // 4. Renderizamos la UI pasándole los datos reales
  // Aquí es donde conectamos con el componente que arreglaste antes
  return <ExamUI attemptData={attempt} />;
}