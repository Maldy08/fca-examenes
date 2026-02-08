import { db } from "@/lib/db";
import Link from "next/link";
// Componente Cliente (Paso 4)
import { toggleExamStatusAction } from "@/actions/exam-actions";
import AddQuestionForm from "@/components/admin/AddQuestionForm";
import DeleteQuestionButton from "@/components/admin/DeleteQuestionButton";
import AddCaseStudyForm from "@/components/admin/AddCaseStudyForm";
import DeleteGroupButton from "@/components/admin/DeleteGroupButton";
import { requireAdminUser } from "@/lib/auth";


interface Props {
  params: Promise<{ examId: string }>;
}

export default async function EditExamPage({ params }: Props) {
  const { examId } = await params;
  const adminUser = await requireAdminUser();

  const exam = await db.exam.findFirst({
    where: {
      id: examId,
      createdById: adminUser.id,
    },
    include: {
      questionGroups: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: true }
          }
        },
        orderBy: { order: 'asc' } // O createdAt
      },
      questions: {
        where: { groupId: null }, // SOLO PREGUNTAS SUELTAS
        orderBy: { order: 'asc' },
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

      {/* 1. LISTA DE CASOS DE ESTUDIO (GRUPOS) */}
      <div className="space-y-8 mb-12">
        {exam.questionGroups.map((group) => (
          <div key={group.id} className="bg-white border-2 border-indigo-100 rounded-xl overflow-hidden shadow-sm">
            {/* Header del Grupo */}
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Caso de Estudio</span>
                <h3 className="text-xl font-bold text-gray-900">{group.title || "Sin Título"}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.content}</p>
              </div>
              <DeleteGroupButton groupId={group.id} examId={examId} />
            </div>

            {/* Preguntas del Grupo */}
            <div className="p-4 bg-gray-50/50 space-y-3">
               {group.questions.length === 0 ? (
                 <p className="text-sm text-gray-400 italic text-center py-4">No hay preguntas en este caso aún.</p>
               ) : (
                 group.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-3 border rounded shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">P{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-800">{q.content}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{q.points} pts</span>
                         <DeleteQuestionButton questionId={q.id} examId={examId} />
                      </div>
                    </div>
                 ))
               )}

               {/* Botón para agregar pregunta al grupo */}
               <div className="mt-4 pt-4 border-t border-dashed">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Agregar pregunta a este caso:</p>
                  <AddQuestionForm examId={examId} groupId={group.id} />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para crear nuevo caso */}
      <AddCaseStudyForm examId={examId} />

      <hr className="my-12 border-gray-200" />

      {/* 2. LISTA DE PREGUNTAS SUELTAS */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Preguntas Sueltas</h3>
      <div className="space-y-4 mb-12">
        {exam.questions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 text-sm">No hay preguntas sueltas.</p>
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

      {/* Formulario para agregar nueva pregunta SUELTA */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Nueva Pregunta Suelta</h3>
        <AddQuestionForm examId={examId} />
      </div>
    </div>
  );
}
