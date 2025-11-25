import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior (Navbar) */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">

        {/* Zona Izquierda: Logo y Menú */}
        <div className="flex items-center gap-6">

          {/* LOGO UABC (Clickeable para ir al inicio) */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logo-uabc.png"
              alt="FCA UABC"
              className="h-10 w-auto object-contain"
            />
            {/* Pequeña línea divisoria vertical */}
            <span className="h-6 w-px bg-gray-300 hidden md:block"></span>
            <span className="font-bold text-gray-700 hidden md:block">Panel Docente</span>
          </Link>

          {/* Enlaces de Navegación */}
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500 ml-2">
            <Link
              href="/dashboard"
              className="hover:text-uabc-green transition-colors"
            >
              Mis Exámenes
            </Link>
            <Link
              href="#"
              className="hover:text-uabc-green transition-colors cursor-not-allowed opacity-50"
              title="Próximamente"
            >
              Alumnos
            </Link>
          </div>
        </div>

        {/* Zona Derecha: Perfil del Profesor */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block font-medium">
            Profe. Maldonado
          </span>
          <div className="h-9 w-9 bg-uabc-green rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
            CM
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main>
        {children}
      </main>
    </div>
  );
}