"use client";

import { logWarningAction } from "@/actions/student-action";
import { useEffect } from "react";


// Agregamos una prop nueva: onKickOut
export default function ProctoringMonitor({ 
  attemptId, 
  onKickOut 
}: { 
  attemptId: string;
  onKickOut: () => void; // Función que el padre nos pasará
}) {
  
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // 1. Registramos la falta y esperamos la respuesta del servidor
        const result = await logWarningAction(attemptId);
        
        // 2. Verificamos si llegamos al límite (3 strikes)
        if (result.success && result.warnings >= 3) {
            // 💀 EJECUTAMOS LA EXPULSIÓN
            onKickOut();
        } else {
            // Solo advertencia leve
            // (Opcional: podrías mostrar un toast aquí diciendo "Llevas X faltas")
            console.log(`Advertencia registrada. Total: ${result.warnings}`);
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        alert("Copiar/Pegar está deshabilitado. Esto podría contar como falta.");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("paste", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("paste", handleCopy);
    };
  }, [attemptId, onKickOut]);

  return null;
}