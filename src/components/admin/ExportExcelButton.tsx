"use client";

import * as XLSX from "xlsx";
import { ExamAttempt, User } from "@prisma/client";

// Definimos el tipo de datos que recibimos (Intento + Usuario)
type ResultData = ExamAttempt & { user: User };

interface Props {
  results: ResultData[];
  examTitle: string;
}

export default function ExportExcelButton({ results, examTitle }: Props) {
  
  const handleDownload = () => {
    // 1. Preparamos los datos para Excel (Formato plano)
    const data = results.map((attempt) => ({
      Nombre: attempt.user.name,
      Correo: attempt.user.email,
      Estado: attempt.status === "completed" ? "Finalizado" : "En Progreso",
      Calificación: attempt.score ?? 0,
      Faltas_Warnings: attempt.warnings,
      Fecha_Inicio: new Date(attempt.startedAt).toLocaleString(),
      Fecha_Fin: attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-",
    }));

    // 2. Creamos una Hoja de Cálculo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Ajustamos ancho de columnas (Opcional, para que se vea bonito)
    const wscols = [
        { wch: 30 }, // Nombre
        { wch: 30 }, // Correo
        { wch: 15 }, // Estado
        { wch: 10 }, // Calificación
        { wch: 10 }, // Faltas
        { wch: 20 }, // Fecha Inicio
    ];
    worksheet['!cols'] = wscols;

    // 4. Creamos el Libro (Workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

    // 5. Descargar archivo
    // Limpiamos el nombre del archivo para que no tenga caracteres raros
    const safeTitle = examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `reporte_${safeTitle}.xlsx`);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 font-medium shadow-sm transition-colors"
    >
      <span>📊</span> Descargar Excel
    </button>
  );
}