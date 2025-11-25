"use client";

import { useEffect } from "react";
import { logWarningAction } from "@/actions/student-actions";

export default function ProctoringMonitor({ attemptId }: { attemptId: string }) {
    useEffect(() => {
        // 1. Detectar cambio de pestaña/ventana
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // El usuario se fue de la pestaña
                logWarningAction(attemptId);
                // Opcional: alert("⚠️ Se ha registrado una falta por salir del examen.");
            }
        };

        // 2. Bloquear clic derecho
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 3. Bloquear copiar/pegar
        const handleCopyCutPaste = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        // Agregar listeners
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopyCutPaste);
        document.addEventListener("cut", handleCopyCutPaste);
        document.addEventListener("paste", handleCopyCutPaste);

        // Cleanup al desmontar
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopyCutPaste);
            document.removeEventListener("cut", handleCopyCutPaste);
            document.removeEventListener("paste", handleCopyCutPaste);
        };
    }, [attemptId]);

    return null; // Componente invisible
}
