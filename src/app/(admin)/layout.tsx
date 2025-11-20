import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior (Navbar) */}
      <nav className="bg-white border-b px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span>🎓</span> FCA Exámenes
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Mis Exámenes</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Alumnos</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Configuración</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden md:block">Hola, Profe CMALDONADO</span>
          <div className="h-8 w-8 bg-blue-100 rounded-full text-blue-700 flex items-center justify-center font-bold text-sm">
            PC
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