import { createExamAction } from "@/actions/exam-actions";
import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";

export default async function CreateExamPage() {
  await requireAdminUser();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-uabc-button-green mb-6 block">
        ← Cancelar y volver
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Examen</h1>

        <form action={createExamAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del Examen</label>
            <input
              name="title"
              required
              placeholder="Ej. Parcial 2: Gestión de la Innovación"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Temas: TRL, Modelos de Negocio..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Acceso (Para alumnos)</label>
            <input
              name="accessCode"
              required
              placeholder="Ej. INNOVA2025"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none font-mono uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">Los alumnos necesitarán este código para entrar.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Tiempo (Minutos)</label>
            <input
              name="timeLimit"
              type="number"
              min="0"
              placeholder="Ej. 60 (Deja 0 para sin límite)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-green outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio (Opcional)</label>
              <input 
                name="startTime" 
                type="datetime-local"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-green outline-none text-gray-600"
              />
              <p className="text-[10px] text-gray-400 mt-1">Antes de esta hora, nadie podrá entrar.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Cierre (Opcional)</label>
              <input 
                name="endTime" 
                type="datetime-local"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-crimson outline-none text-gray-600"
              />
              <p className="text-[10px] text-gray-400 mt-1">A esta hora, el examen se cierra para todos.</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-uabc-button-green text-white py-3 rounded-lg font-medium hover:bg-uabc-green transition-colors"
          >
            Crear y Agregar Preguntas →
          </button>
        </form>
      </div>
    </div>
  );
}
