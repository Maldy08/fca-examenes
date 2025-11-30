import { Question, Answer, Option } from "@prisma/client";

// Tipo auxiliar
type QuestionWithOptions = Question & { options: Option[] };

interface Props {
  index: number;
  question: QuestionWithOptions;
  answer?: Answer;
}

export default function ReviewCard({ index, question, answer }: Props) {
  const isCorrect = answer?.isCorrect;
  const score = answer?.pointsAwarded ?? 0;

  // Renderizar respuesta según el tipo
  const renderAnswerContent = () => {
    if (question.type === "MULTIPLE_CHOICE") {
      return (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = answer?.selectedOptionId === opt.id;
            const isTheCorrectOption = opt.isCorrect;
            
            // Definimos estilos dinámicos
            let styleClass = "border-gray-200 bg-white text-gray-600"; // Default
            
            if (isSelected && isTheCorrectOption) {
                styleClass = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500"; // Seleccionó la correcta
            } else if (isSelected && !isTheCorrectOption) {
                styleClass = "border-red-300 bg-red-50 text-red-800 line-through decoration-red-500"; // Seleccionó la incorrecta
            } else if (!isSelected && isTheCorrectOption) {
                styleClass = "border-green-300 bg-green-50/50 text-green-700"; // Esta era la correcta (y no la viste)
            }

            return (
              <div key={opt.id} className={`p-3 border rounded-lg text-sm flex justify-between items-center ${styleClass}`}>
                <span>{opt.text}</span>
                {isSelected && <span>{isTheCorrectOption ? "✅ Tu respuesta" : "❌ Tu respuesta"}</span>}
                {!isSelected && isTheCorrectOption && <span className="text-xs uppercase font-bold">Respuesta Correcta</span>}
              </div>
            );
          })}
        </div>
      );
    }

    // Para Texto Abierto y SQL
    return (
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 border rounded-md text-sm font-mono text-gray-700 whitespace-pre-wrap">
            {answer?.textAnswer || <span className="italic text-gray-400">Sin respuesta</span>}
        </div>
        <p className="text-xs text-gray-500">
            * Esta pregunta requiere revisión manual o validación de código.
        </p>
      </div>
    );
  };

  return (
    <div className={`border rounded-xl overflow-hidden mb-6 ${isCorrect ? 'border-green-200 shadow-sm' : 'border-red-100'}`}>
      {/* Header de la Pregunta */}
      <div className={`px-6 py-3 border-b flex justify-between items-start ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
        <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-50 block mb-1">Pregunta {index}</span>
            <h3 className="font-semibold text-gray-800">{question.content}</h3>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-bold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {score} / {question.points} pts
        </div>
      </div>

      {/* Cuerpo de la Respuesta */}
      <div className="p-6 bg-white">
        {renderAnswerContent()}
      </div>
    </div>
  );
}