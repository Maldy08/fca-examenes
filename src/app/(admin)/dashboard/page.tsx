import Link from "next/link";
import { getExamsByTeacher } from "@/lib/data-fetch";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Verificamos sesión de Clerk
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]) {
    return redirect("/");
  }

  const email = user.emailAddresses[0].emailAddress;

  // 2. BUSCAMOS AL USUARIO EN LA BD
  const dbUser = await db.user.findUnique({ 
    where: { email } 
  });

  // 3. 🛑 REGLA DE ORO: SI NO EXISTE O NO ES ADMIN, VA PARA AFUERA
  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              La cuenta <strong>{email}</strong> no tiene permisos de docente.
            </p>
            <p className="text-sm text-gray-400 mb-6">
                Si eres profesor, solicita al administrador que te agregue a la lista autorizada.
            </p>
            <Link href="/" className="block w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors">
              Volver al Inicio
            </Link>
        </div>
      </div>
    );
  }

  // 4. Si llegamos aquí, es porque SÍ es ADMIN. ¡Bienvenido!
  const exams = await getExamsByTeacher(dbUser.id);

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {dbUser.name}</h1>
          <p className="text-gray-500 mt-1">Panel de Administración Docente</p>
        </div>

        <Link
          href="/exams/create"
          className="bg-uabc-button-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-uabc-green shadow-sm transition-all flex items-center gap-2"
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
                <span className={`px-2 py-1 text-xs font-semibold rounded ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
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

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <Link href={`/exams/${exam.id}/results`} className="text-uabc-button-green font-medium text-sm hover:underline">
                Ver Resultados
              </Link>
              <Link href={`/exams/${exam.id}/edit`} className="text-gray-500 hover:text-uabc-button-green text-sm flex items-center gap-1 font-medium transition-colors">
                <span>⚙️</span> Editar
              </Link>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 min-h-[200px]">
            <span className="text-4xl mb-2">+</span>
            <span className="font-medium">No tienes exámenes aún</span>
          </div>
        )}
      </div>
    </div>
  );
}