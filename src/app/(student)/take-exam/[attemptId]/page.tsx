"use client";

import { useState, useEffect } from "react";
import QuestionCard from "@/components/exam-taker/QuestionCard";
import { Question } from "@/types/exam";

// --- DATOS MOCK (Para probar sin BD aún) ---
const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "multiple-choice",
    content: "En el contexto de Gestión de la Innovación, ¿qué significan las siglas TRL?",
    options: [
      { id: "o1", text: "Technology Readiness Level" },
      { id: "o2", text: "Total Return on Logistics" },
      { id: "o3", text: "Technical Requirement List" },
    ],
  },
  {
    id: "q2",
    type: "code_sql",
    content: "Escribe una consulta SQL para obtener el nombre y salario de los empleados que ganan más de 5000, ordenados por salario descendente.",
  },
  {
    id: "q3",
    type: "open_text",
    content: "Explica brevemente la diferencia entre una base de datos SQL y una NoSQL y da un ejemplo de uso para cada una.",
  },
];

export default function ExamPage({ params }: { params: { attemptId: string } }) {
  // 1. ESTADO: ¿En qué pregunta estamos?
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 2. ESTADO: Mapa de respuestas { "q1": "o1", "q2": "SELECT..." }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // 3. ESTADO: Simulación de guardado
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const totalQuestions = MOCK_QUESTIONS.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Lógica para manejar el cambio de respuesta
  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));

    // SIMULACIÓN DE GUARDADO (Aquí iría tu Server Action)
    setIsSaving(true);
    // Debounce simulado: espera 1 segundo para decir "guardado"
    const timeoutId = setTimeout(() => {
      setIsSaving(false);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* BARRA SUPERIOR: Progreso y Tiempo */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Examen Parcial 1</span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-500">Intento ID: {params.attemptId}</span>
        </div>
        
        <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
            ⏱️ 58:20 restantes
        </div>
      </header>

      {/* BARRA DE PROGRESO VISUAL */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
            className="bg-blue-600 h-1.5 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* AREA PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center max-w-4xl mx-auto w-full">
        
        {/* Navegación de preguntas (Paginador rápido) */}
        <div className="w-full flex justify-between items-center mb-6 text-sm text-gray-500">
            <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
            <span className="text-xs uppercase tracking-wider">
                {currentQuestion.type.replace('_', ' ')}
            </span>
        </div>

        {/* COMPONENTE DE TARJETA QUE HICIMOS ANTES */}
        <QuestionCard
          key={currentQuestion.id} // Importante para resetear estado interno si lo hubiera
          question={currentQuestion}
          currentAnswer={answers[currentQuestion.id] || ""}
          onAnswerChange={handleAnswerChange}
          isSaving={isSaving}
        />

        {/* BOTONES DE ACCIÓN */}
        <div className="w-full flex justify-between mt-8 max-w-3xl">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            ← Anterior
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button
              className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
              onClick={() => alert("¡Examen enviado! (Lógica pendiente)")}
            >
              Finalizar Examen
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              Siguiente →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}