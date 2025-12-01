"use client";

import { useEffect, useState } from "react";

interface Props {
  startedAt: Date;            // Cuándo empezó el alumno
  timeLimitMin: number;       // Duración en minutos (0 = sin límite de duración)
  hardDeadline?: Date | null; // Fecha/Hora exacta de cierre (opcional)
  onTimeUp: () => void;       // Función a ejecutar cuando se acabe cualquiera de los dos tiempos
}

export default function ExamTimer({ startedAt, timeLimitMin, hardDeadline, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // 1. Calcular fin por DURACIÓN (Ej. Empezó 10:00 + 60min = 11:00)
    // Si timeLimitMin es 0, usamos una fecha muy lejana (año 2100)
    const durationEnd = timeLimitMin > 0 
        ? new Date(startedAt).getTime() + (timeLimitMin * 60 * 1000)
        : new Date(2100, 0, 1).getTime(); 

    // 2. Calcular fin por FECHA DE CIERRE (Ej. El examen cierra hoy a las 10:30)
    const absoluteEnd = hardDeadline 
        ? new Date(hardDeadline).getTime() 
        : new Date(2100, 0, 1).getTime();

    // 3. LA HORA REAL DE FIN ES LA QUE OCURRA PRIMERO
    // (El alumno sale cuando se le acaban sus 60 min O cuando dan las 10:30, lo que pase antes)
    const finalEndTime = Math.min(durationEnd, absoluteEnd);

    const tick = () => {
      const now = new Date().getTime();
      const diff = finalEndTime - now;

      if (diff <= 0) {
        // ¡SE ACABÓ EL TIEMPO!
        setTimeLeft(0);
        onTimeUp(); 
      } else {
        setTimeLeft(diff);
      }
    };

    // Ejecutamos inmediatamente y luego cada segundo
    tick();
    const timerId = setInterval(tick, 1000);

    return () => clearInterval(timerId);
  }, [startedAt, timeLimitMin, hardDeadline, onTimeUp]);

  // Si aún no calculamos, no mostramos nada para evitar "saltos" visuales
  if (timeLeft === null) return null;

  // Formatear a HH:MM:SS
  const hours = Math.floor(timeLeft / 1000 / 60 / 60);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Colores de advertencia (Menos de 5 min = Rojo y parpadeante)
  const isUrgent = timeLeft < 5 * 60 * 1000; 

  return (
    <div className={`font-mono text-sm px-3 py-1 rounded border flex items-center gap-2 transition-colors ${
      isUrgent 
        ? "bg-red-50 text-red-600 border-red-200 animate-pulse font-bold" 
        : "bg-gray-100 text-gray-700 border-gray-200"
    }`}>
      <span>⏱️</span>
      <span>
        {hours > 0 && `${hours}:`}
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </span>
      <span className="text-xs opacity-70 hidden sm:inline">restantes</span>
    </div>
  );
}