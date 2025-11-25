import Link from "next/link";

export default function FinishedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Examen Enviado</h1>
        <p className="text-gray-600 mb-8">Tus respuestas se guardaron correctamente.</p>
        <Link href="/" className="block w-full py-3 bg-uabc-green text-white rounded-lg font-bold">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}