import { getExamAttempt } from "@/lib/data-fetch";
import ExamUI, { ExamItem } from "@/components/exam-taker/ExamUI";
import { notFound, redirect } from "next/navigation"; // Importar redirect

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

// 1. FUNCIÓN HELPER PARA MEZCLAR (Algoritmo Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// OBLIGAMOS A QUE ESTA PÁGINA NO SE GUARDE EN CACHÉ
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TakeExamPage({ params }: PageProps) {
  const { attemptId } = await params;
  const attempt = await getExamAttempt(attemptId);
  

  if (!attempt) return notFound();

  // --- CANDADO DE SEGURIDAD 🔒 ---
  // Si el examen ya se terminó (por tiempo, por strikes o manual), lo sacamos.
  if (attempt.status === 'completed') {
    redirect(`/boleta/${attempt.id}`); // O /finished si usaste esa
  }
  // ------------------------------

  // 2. PREPARAR ITEMS PARA EL EXAMEN (MEZCLA)
  
  // A) Preguntas Sueltas
  const looseQuestions = attempt.exam.questions || [];
  const looseItems: ExamItem[] = looseQuestions.map(q => ({
    type: 'question',
    data: q
  }));

  // B) Grupos (Casos)
  // @ts-ignore - Prisma types might be lagging
  const groups = attempt.exam.questionGroups || [];
  const groupItems: ExamItem[] = groups.map((g: any) => ({
    type: 'group',
    data: {
      ...g,
      // Barajamos las preguntas DENTRO del grupo
      questions: shuffleArray(g.questions)
    }
  }));

  // C) Mezclar todo junto
  const allItems = [...looseItems, ...groupItems];
  const shuffledItems = shuffleArray(allItems);

  // Pasamos 'attempt' y los 'items' ya procesados
  return <ExamUI attemptData={attempt} items={shuffledItems} />;
}