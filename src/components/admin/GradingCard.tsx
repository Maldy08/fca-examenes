"use client";

import { useState } from "react";
import { Question, Answer, Option } from "@prisma/client";
import { updateAnswerScoreAction } from "@/actions/teacher-actions";

// Tipo extendido para incluir las opciones dentro de la pregunta
type QuestionWithOptions = Question & { options: Option[] };

interface Props {
  index: number;
  question: QuestionWithOptions;
  answer?: Answer;
  attemptId: string;
  examId: string;
}

export default function GradingCard({ index, question, answer, attemptId, examId }: Props) {
  const [score, setScore] = useState(answer?.pointsAwarded ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateScore = async () => {
    if (!answer) return; // No se puede calificar si no respondió nada (o habría que crear respuesta vacía)

    setIsSaving(true);
    await updateAnswerScoreAction(answer.id, Number(score), attemptId, examId);
    setIsSaving(false);
    // Aquí podrías poner un toast/notificación de éxito
  };

  // Helper para renderizar la respuesta según el tipo
  const renderStudentResponse = () => {
    if (!answer) return <span className="text-red-500 italic">Sin respuesta</span>;

    if (question.type === "MULTIPLE_CHOICE") {
      const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
      return (
        <div className="flex items-center gap-2">
          <span className={selectedOption?.isCorrect ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
            {selectedOption?.text || "Opción inválida"}
          </span>
          {/* Mostrar la correcta si se equivocó */}
          {!selectedOption?.isCorrect && (
            <span className="text-sm text-gray-500 ml-2">
              (Correcta: {question.options.find(o => o.isCorrect)?.text})
            </span>
          )}
        </div>
      );
    }

    if (question.type === "CODE_SQL") {
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto mt-2">
          {answer.textAnswer}
        </pre>
      );
    }

    return <p className="p-3 bg-gray-50 rounded text-gray-800 border">{answer.textAnswer}</p>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de la Pregunta */}
      <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
        <span className="font-semibold text-gray-700">Pregunta {index}</span>
        <span className="text-xs uppercase px-2 py-1 bg-gray-200 rounded text-gray-600">
          {question.type}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1 y 2: Contenido y Respuesta (Ocupa 2/3) */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{question.content}</h3>
            <div className="mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Respuesta del Alumno:</span>
              <div className="mt-1">
                {renderStudentResponse()}
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3: Panel de Calificación (Ocupa 1/3) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col justify-center">
          <label className="text-sm font-bold text-blue-800 mb-2 block">
            Puntaje (Max: {question.points})
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => { /* Assuming onGrade(true) would set score to max points */ setScore(question.points); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${score === question.points
                  ? "bg-uabc-button-green text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Correcta
            </button>
            <button
              onClick={() => { /* Assuming onGrade(false) would set score to 0 */ setScore(0); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${score === 0
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              Incorrecta
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="number"
              min="0"
              max={question.points}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-20 p-2 border border-blue-300 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-gray-500">/ {question.points}</span>
          </div>

          <button
            onClick={handleUpdateScore}
            disabled={isSaving || !answer}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isSaving ? "Guardando..." : "Actualizar Puntaje"}
          </button>
        </div>
      </div>
    </div>
  );
}