"use client";

import { Question as PrismaQuestion, Option } from "@prisma/client";

// Extendemos el tipo para asegurar que TS sepa que puede venir una imagen
// (Aunque no hayas regenerado prisma, esto ayuda a evitar errores en el editor)
type QuestionWithOptions = PrismaQuestion & {
  options: Option[];
  imageUrl?: string | null;
};

interface QuestionCardProps {
  question: QuestionWithOptions;
  currentAnswer: string | null;
  onAnswerChange: (val: string) => void;
  isSaving?: boolean;
}

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswerChange,
  isSaving = false,
}: QuestionCardProps) {

  const renderInput = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${currentAnswer === option.id
                  ? "border-uabc-button-green bg-uabc-button-green/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={currentAnswer === option.id}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="w-5 h-5 text-uabc-button-green focus:ring-uabc-button-green accent-uabc-button-green"
                />
                <span className="ml-3 text-gray-700 font-medium">
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        );

      case "OPEN_TEXT":
        return (
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green focus:border-transparent min-h-[150px] text-gray-800"
            placeholder="Escribe tu respuesta aquí..."
            value={currentAnswer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
          />
        );

      case "CODE_SQL":
        return (
          <div className="relative group">
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              SQL Editor
            </div>
            <textarea
              className="w-full p-4 bg-[#1e1e1e] text-gray-200 font-mono text-sm rounded-lg focus:ring-2 focus:ring-uabc-button-green focus:border-transparent min-h-[200px] leading-relaxed"
              placeholder="SELECT * FROM..."
              spellCheck={false}
              value={currentAnswer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
            />
          </div>
        );

      default:
        return <p className="text-red-500">Tipo de pregunta no soportado: {question.type}</p>;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className="bg-gray-50 p-6 border-b border-gray-100">

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 leading-snug">
          {question.content}
        </h2>

        {/* --- AQUÍ SE MUESTRA LA IMAGEN --- */}
        {question.imageUrl && (
          <div className="mt-4 mb-2 flex justify-center">
            <img
              src={question.imageUrl}
              alt="Imagen de referencia"
              className="rounded-lg border border-gray-200 shadow-sm max-h-[300px] w-auto object-contain bg-white"
            />
          </div>
        )}
        {/* ---------------------------------- */}

        {/* Indicador de Guardado */}
        <div className="mt-2 h-4 flex items-center justify-end">
          {isSaving ? (
            <span className="text-xs text-amber-600 animate-pulse flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Guardando...
            </span>
          ) : (
            <span className="text-xs text-green-600 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Guardado
            </span>
          )}
        </div>
      </div>

      <div className="p-6 bg-white">
        {renderInput()}
      </div>
    </div>
  );
}