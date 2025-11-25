import Link from "next/link";
import { UserButton } from "@clerk/nextjs"; // El botón mágico (Avatar + Logout)
import { currentUser } from "@clerk/nextjs/server"; // Para leer tus datos desde el servidor

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Obtenemos los datos del usuario logueado
  const user = await currentUser();
  
  // 2. Extraemos nombre y correo de forma segura
  const firstName = user?.firstName || "Docente";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  
  // Clerk guarda los correos en un array, tomamos el primero
  const email = user?.emailAddresses[0]?.emailAddress || "Sin correo";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior (Navbar) */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">

        {/* Zona Izquierda: Logo y Menú */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logo-uabc.png"
              alt="FCA UABC"
              className="h-10 w-auto object-contain"
            />
            <span className="h-6 w-px bg-gray-300 hidden md:block"></span>
            <span className="font-bold text-gray-700 hidden md:block">Panel Docente</span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500 ml-2">
            <Link
              href="/dashboard"
              className="hover:text-uabc-green transition-colors"
            >
              Mis Exámenes
            </Link>
          </div>
        </div>

        {/* Zona Derecha: Datos del Profe + Logout */}
        <div className="flex items-center gap-4">
          
          {/* Información de Texto (Nombre y Correo) */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-gray-800 leading-tight">
              {fullName}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {email}
            </span>
          </div>

          {/* El componente UserButton de Clerk:
             1. Muestra tu foto de Google.
             2. Al hacer clic, abre un menú flotante.
             3. En ese menú está el botón "Sign Out" (Cerrar Sesión).
          */}
          <div className="ring-2 ring-gray-100 rounded-full bg-gray-50">
            <UserButton afterSignOutUrl="/" />
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