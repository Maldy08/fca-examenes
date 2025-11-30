import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoletaPage({ params }: PageProps) {
  const { id } = await params; // Desempaquetamos el ID

  const attempt = await db.examAttempt.findUnique({
    where: { id: id },
    include: {
      exam: true,
      user: true,
      answers: true
    }
  });

  if (!attempt) return notFound();

  // Calcular calificación visual (Asumiendo que score ya está calculado en la BD)
  const score = attempt.score ?? 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-gray-200">

        <div className="bg-gray-900 p-6 text-white text-center">
          <h1 className="text-xl font-bold">{attempt.exam.title}</h1>
          <p className="text-gray-400 text-sm mt-1">Boleta de Calificaciones</p>
        </div>

        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-uabc-button-green/10 rounded-full flex items-center justify-center mx-auto text-2xl">
              🎓
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{attempt.user.name}</h2>

          <div className="my-8 py-6 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Tu Resultado</p>
            <div className="text-5xl font-extrabold text-uabc-button-green">
              {score}
            </div>
          </div>

          {/* --- NUEVO BOTÓN: Ver Revisión --- */}
          <Link
            href={`/review/${attempt.id}`}
            className="block w-full py-3 mb-3 bg-white text-uabc-button-green border-2 border-uabc-button-green rounded-lg font-bold hover:bg-green-50 transition-colors shadow-sm"
          >
            Ver Examen Calificado 📝
          </Link>
          {/* --------------------------------- */}

          <Link
            href="/"
            className="block w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Salir / Finalizar
          </Link>
        </div>
      </div>
    </div>
  );
}