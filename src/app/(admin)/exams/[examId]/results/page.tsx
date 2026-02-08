import ExportExcelButton from "@/components/admin/ExportExcelButton";
import { getExamResults, getExamDetails } from "@/lib/data-fetch";
import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";

interface Props {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamResultsPage({ params }: Props) {
  // Ejecutamos las dos consultas en paralelo para que cargue más rápido
  const { examId } = await params;
  const adminUser = await requireAdminUser();
  const [exam, results] = await Promise.all([
    getExamDetails(examId, adminUser.id),  // <--- Aquí usamos la variable limpia
    getExamResults(examId, adminUser.id)
  ]);
  if (!exam) return <div>Examen no encontrado</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-500">Reporte de Calificaciones</p>
        </div>
        <div className="space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:underline">
            Volver al Dashboard
          </Link>
          <ExportExcelButton results={results} examTitle={exam.title} />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntaje (Auto)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conducta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Nadie ha tomado este examen todavía.
                </td>
              </tr>
            ) : (
              results.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-uabc-button-green/10 flex items-center justify-center text-uabc-button-green font-bold mr-3">
                        {attempt.user.name?.charAt(0) || "A"}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.user.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-11">{attempt.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attempt.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {attempt.status === "completed" ? "Finalizado" : "En Progreso"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Mostramos el score o un guion si es nulo */}
                    {attempt.score !== null ? attempt.score : "-"} pts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attempt.warnings === 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Limpio
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        ⚠️ {attempt.warnings} Faltas
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attempt.startedAt).toLocaleDateString()}
                    <span className="text-xs ml-1 text-gray-400">
                      {new Date(attempt.startedAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/exams/${examId}/results/${attempt.id}`}
                      className="text-uabc-button-green hover:text-uabc-green"
                    >
                      Revisar Examen
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
