import GradingCard from "@/components/admin/GradingCard";
import { db } from "@/lib/db";
import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
// Crearemos este componente en el paso 3

interface PageProps {
  // 1. Definimos params como promesa
  params: Promise<{
    examId: string;
    attemptId: string;
  }>;
}

export default async function ReviewExamPage({ params }: PageProps) {
  const { examId, attemptId } = await params;
  const adminUser = await requireAdminUser();
  // 1. Obtener el intento con TODA la información (Preguntas, Opciones, Respuestas del Alumno)
  const attempt = await db.examAttempt.findFirst({
    where: {
      id: attemptId,
      examId,
      exam: {
        is: {
          createdById: adminUser.id,
        },
      },
    },
    include: {
      user: true,
      answers: true,
      exam: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: true },
          },
        },
      },
    },
  });

  if (!attempt) return <div>Intento no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* Header de Navegación */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href={`/exams/${examId}/results`}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm"
        >
          ← Volver a la lista
        </Link>
        <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">{attempt.user.name}</h1>
            <p className="text-sm text-gray-500">{attempt.user.email}</p>
        </div>
      </div>

      {/* Tarjeta de Resumen Global */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-semibold text-gray-700">Calificación Final</h2>
            <p className="text-sm text-gray-400">Se actualiza automáticamente al calificar preguntas</p>
        </div>
        <div className="text-4xl font-bold text-blue-600">
            {attempt.score ?? 0} <span className="text-lg text-gray-400 font-normal">pts</span>
        </div>
      </div>

      {/* Lista de Preguntas para Revisar */}
      <div className="space-y-6">
        {attempt.exam.questions.map((question, index) => {
          // Buscamos la respuesta que dio el alumno a esta pregunta
          const studentAnswer = attempt.answers.find(a => a.questionId === question.id);
          
          return (
            <GradingCard 
              key={question.id}
              index={index + 1}
              question={question}
              answer={studentAnswer}
              attemptId={attempt.id}
              examId={attempt.exam.id}
            />
          );
        })}
      </div>
    </div>
  );
}
