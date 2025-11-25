import Link from "next/link";

export default function FinishedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">

        {/* Icono de Celebración */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>

        {/* Mensaje Principal */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Examen Enviado!</h1>

        <p className="text-gray-600 mb-8">
          Tus respuestas han sido guardadas correctamente en el sistema.
          <br />
          Tu profesor revisará las preguntas abiertas pronto.
        </p>

        {/* Botón de Salida */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-uabc-button-green text-white rounded-lg font-medium hover:bg-uabc-green transition-colors shadow-md hover:shadow-lg"
          >
            Volver al Inicio
          </Link>

          <p className="text-xs text-gray-400 mt-4">
            Puedes cerrar esta ventana con seguridad.
          </p>
        </div>
      </div>
    </div>
  );
}