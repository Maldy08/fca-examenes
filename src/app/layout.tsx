import { ClerkProvider } from "@clerk/nextjs"; // Importar esto
import "./globals.css";
// ... otros imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Envolvemos todo el HTML con ClerkProvider
    <ClerkProvider>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}