import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plataforma de Exámenes UABC",
  description: "Sistema de evaluación docente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          {/* 🛡️ BLOQUEO DE SEGURIDAD: JAVASCRIPT REQUERIDO */}
          <noscript>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2rem',
              color: '#1f2937'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
                JavaScript es Requerido
              </h1>
              <p style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.5' }}>
                Para garantizar la integridad y seguridad del examen, <strong>es obligatorio tener JavaScript activado</strong>.
              </p>
              <p style={{ marginTop: '1rem', color: '#4b5563' }}>
                El sistema no cargará hasta que habilites esta función en tu navegador.
              </p>
            </div>
          </noscript>
          {/* 🛡️ FIN DEL BLOQUEO */}

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}