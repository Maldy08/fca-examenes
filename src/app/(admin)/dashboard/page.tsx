import Link from "next/link";
import { getAllExams } from "@/lib/data-fetch";

export default async function DashboardPage() {
  const exams = await getAllExams();

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Encabezado de la sección */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Exámenes</h1>
          <p className="text-gray-500 mt-1">Gestiona tus evaluaciones y revisa el progreso.</p>
        </div>
        
        <Link 
          href="/exams/create" // (Aún no creamos esta ruta, pero dejamos el link listo)
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
        >
          <span>+</span> Crear Nuevo Examen
        </Link>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800`}>
                   {exam.isActive ? 'ACTIVO' : 'BORRADOR'}
                </span>
                <span className="text-xs text-gray-400 font-mono">Código: {exam.accessCode}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {exam.description || "Sin descripción"}
              </p>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>📝</span> {exam._count.attempts} Intentos
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span> {exam.timeLimitMin || "∞"} min
                </div>
              </div>
            </div>

            {/* Footer de la tarjeta con acciones */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <Link 
                href={`/exams/${exam.id}/results`}
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                Ver Resultados
              </Link>
              
              {/* Enlace temporal para editar (luego lo haremos funcional) */}
              <button className="text-gray-400 hover:text-gray-600 text-sm">
                ⚙️ Configurar
              </button>
            </div>
          </div>
        ))}

        {/* Tarjeta de "Crear Nuevo" (Visualmente atractiva para invitar a la acción) */}
        {exams.length === 0 && (
             <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer bg-gray-50/50 h-full min-h-[200px]">
                <span className="text-4xl mb-2">+</span>
                <span className="font-medium">Crear tu primer examen</span>
             </div>
        )}
      </div>
    </div>
  );
}