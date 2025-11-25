import JoinExamForm from "@/components/home/JoinExamForm";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header Verde Institucional */}
        <div className="bg-uabc-green p-8 text-center relative">

          {/* --- ZONA DEL LOGO --- */}
          <div className="flex justify-center mb-6">
            {/* Usamos una 'pastilla' blanca rectangular.
                px-6: Espacio a los lados.
                py-3: Espacio arriba y abajo.
                rounded-xl: Bordes suavemente redondeados (no círculo).
             */}
            <div className="bg-white rounded-xl px-6 py-4 shadow-lg w-full max-w-[280px] flex items-center justify-center">
              {/* Referencia a la imagen en la carpeta public */}
              <img
                src="/logo-uabc.png"
                alt="Escudo FCA UABC"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          {/* --------------------- */}

          <h1 className="text-2xl font-bold text-white mb-1">FCA Exámenes</h1>
          <p className="text-white/80 font-medium text-sm">Plataforma de Evaluación Digital</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">Bienvenido, Cimarrón</h2>
            <p className="text-sm text-gray-500 mt-1">Introduce tus datos y el código del examen.</p>
          </div>

          <JoinExamForm />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t">
          <Link href="/dashboard" className="text-xs text-uabc-green hover:text-green-800 transition-colors font-bold uppercase tracking-wide">
            Acceso para Docentes
          </Link>
        </div>
      </div>
    </div>
  );
}