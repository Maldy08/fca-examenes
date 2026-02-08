import { getExamAttempt } from "@/lib/data-fetch";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReviewCard from "@/components/exam-taker/ReviewCard";
import { getStudentIdFromSession } from "@/lib/student-session";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ReviewExamPage({ params }: PageProps) {
  const { attemptId } = await params;
  const studentId = await getStudentIdFromSession();
  if (!studentId) return redirect("/");

  const attempt = await getExamAttempt(attemptId, studentId);

  if (!attempt) return notFound();

  // Solo permitimos ver la revisión si ya terminó
  if (attempt.status !== 'completed') {
    redirect(`/take-exam/${attemptId}`);
  }

  // Helpers para buscar respuestas
  const getAnswer = (qId: string) => attempt.answers.find(a => a.questionId === qId);

  // CONTADORES GLOBALES
  let questionCounter = 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header de Navegación */}
        <div className="mb-6 flex justify-between items-center">
            <Link href={`/boleta/${attemptId}`} className="text-uabc-button-green hover:underline flex items-center gap-2 font-medium">
                ← Volver a la Boleta
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Revisión: {attempt.exam.title}</h1>
        </div>

        {/* 1. CASOS DE ESTUDIO (GRUPOS) */}
        <div className="space-y-8 mb-8">
            {attempt.exam.questionGroups?.map((group) => (
                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Encabezado del Caso */}
                    <div className="bg-uabc-blue/5 p-6 border-b border-gray-200">
                        <span className="text-xs font-bold text-uabc-secondary-blue uppercase tracking-wider">Caso de Estudio</span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">{group.title}</h2>
                        <div className="mt-3 p-4 bg-white rounded-lg border text-sm text-gray-600 whitespace-pre-wrap font-serif leading-relaxed">
                            {group.content}
                        </div>
                    </div>

                    {/* Preguntas del Caso */}
                    <div className="p-6 bg-gray-50 space-y-6">
                        {group.questions.map((q) => {
                            questionCounter++;
                            return (
                                <ReviewCard 
                                    key={q.id}
                                    index={questionCounter}
                                    question={q}
                                    answer={getAnswer(q.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* 2. PREGUNTAS SUELTAS */}
        <div className="space-y-6">
            {attempt.exam.questions?.length > 0 && (
                <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Preguntas Generales</h2>
            )}
            
            {attempt.exam.questions?.map((q) => {
                questionCounter++;
                return (
                    <ReviewCard 
                        key={q.id}
                        index={questionCounter}
                        question={q}
                        answer={getAnswer(q.id)}
                    />
                );
            })}
        </div>

      </div>
    </div>
  );
}
