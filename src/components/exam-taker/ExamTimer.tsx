"use client";

import { useEffect, useState } from "react";

interface Props {
  startedAt: Date;        // Cuándo empezó el alumno
  timeLimitMin: number;   // Cuántos minutos dura el examen
  onTimeUp: () => void;   // Función a ejecutar cuando el tiempo se acabe
}

export default function ExamTimer({ startedAt, timeLimitMin, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // 1. Calculamos la hora exacta en que DEBE terminar el examen
    const startTime = new Date(startedAt).getTime();
    const durationMs = timeLimitMin * 60 * 1000;
    const endTime = startTime + durationMs;

    // Función que actualiza el contador
    const tick = () => {
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        // ¡SE ACABÓ EL TIEMPO!
        setTimeLeft(0);
        onTimeUp(); // Llamamos a la función para cerrar el examen
      } else {
        setTimeLeft(diff);
      }
    };

    // Ejecutamos inmediatamente y luego cada segundo
    tick();
    const timerId = setInterval(tick, 1000);

    return () => clearInterval(timerId);
  }, [startedAt, timeLimitMin, onTimeUp]);

  // Si aún no calculamos, no mostramos nada para evitar "saltos" visuales
  if (timeLeft === null) return null;

  // Formatear a MM:SS
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const hours = Math.floor(timeLeft / 1000 / 60 / 60);

  // Colores de advertencia (Menos de 5 min = Rojo)
  const isUrgent = timeLeft < 5 * 60 * 1000; 

  return (
    <div className={`font-mono text-sm px-3 py-1 rounded border flex items-center gap-2 ${
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