import Link from "next/link";

export default function FinishedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Examen Enviado!</h1>
        <p className="text-gray-600 mb-8">
          Tus respuestas han sido guardadas correctamente. Tu profesor revisará las preguntas abiertas pronto.
        </p>

        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}