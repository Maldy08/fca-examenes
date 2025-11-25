import { db } from "@/lib/db";
import Link from "next/link";
// Componente Cliente (Paso 4)
import { toggleExamStatusAction } from "@/actions/exam-actions";
import AddQuestionForm from "@/components/admin/AddQuestionForm";
import DeleteQuestionButton from "@/components/admin/DeleteQuestionButton";

interface Props {
  params: Promise<{ examId: string }>;
}

export default async function EditExamPage({ params }: Props) {
  const { examId } = await params;

  const exam = await db.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { order: 'asc' }, // Asumiendo que tienes campo order, si no usa createdAt
        include: { options: true }
      }
    }
  });

  if (!exam) return <div>Examen no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-uabc-button-green">← Volver al Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{exam.title}</h1>
          <p className="text-gray-500 font-mono text-sm bg-gray-100 inline-block px-2 py-1 rounded mt-1">
            Código: {exam.accessCode}
          </p>
        </div>
        <form action={toggleExamStatusAction.bind(null, examId, !exam.isActive)}>
          <button
            className={`px-4 py-2 rounded font-bold text-sm ${exam.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {exam.isActive ? '🟢 PUBLICADO' : '⚫ BORRADOR'}
          </button>
        </form>
      </div>

      {/* Lista de Preguntas Existentes */}
      <div className="space-y-4 mb-12">
        {exam.questions.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">Este examen aún no tiene preguntas.</p>
          </div>
        ) : (
          exam.questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-4 border rounded-lg shadow-sm flex justify-between items-center group">
              <div>
                <span className="font-bold text-gray-400 mr-3">#{idx + 1}</span>
                <span className="font-medium text-gray-800">{q.content}</span>
                <span className="ml-3 text-xs bg-uabc-button-green/10 text-uabc-button-green px-2 py-1 rounded uppercase">{q.type}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{q.points} pts</span>
                <DeleteQuestionButton questionId={q.id} examId={examId} />
              </div>
            </div>


          ))
        )}
      </div>

      {/* Formulario para agregar nueva pregunta (Al final) */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Nueva Pregunta</h3>
        <AddQuestionForm examId={examId} />
      </div>
    </div>
  );
}