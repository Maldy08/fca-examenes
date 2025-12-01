"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Componentes internos
import QuestionCard from "@/components/exam-taker/QuestionCard";
import ProctoringMonitor from "./ProctoringMonitor";
import ExamTimer from "./ExamTimer";

// Server Actions
import { checkExamStatusAction, finishExamAction, saveAnswerAction } from "@/actions/student-action";

// Tipos de Prisma
import { Exam, Question, Option, ExamAttempt, QuestionGroup } from "@prisma/client";

// Tipo complejo para incluir las relaciones
type QuestionWithOptions = Question & { options: Option[] };
type GroupWithQuestions = QuestionGroup & { questions: QuestionWithOptions[] };

// Un item puede ser una pregunta suelta O un grupo
export type ExamItem = 
  | { type: 'question', data: QuestionWithOptions }
  | { type: 'group', data: GroupWithQuestions };

interface ExamUIProps {
  attemptData: ExamAttempt & { exam: Exam };
  items: ExamItem[]; // <--- AHORA RECIBIMOS ITEMS MEZCLADOS
}

export default function ExamUI({ attemptData, items }: ExamUIProps) {
  
  // Estados
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const router = useRouter();

  // Variables derivadas
  const currentItem = items[currentIndex];
  const totalItems = items.length;
  const progress = ((currentIndex + 1) / totalItems) * 100;

  // Cargar respuestas previas
  useEffect(() => {
    // @ts-ignore
    if (attemptData.answers) {
      const initialAnswers: Record<string, string> = {};
      // @ts-ignore
      attemptData.answers.forEach((ans) => {
        initialAnswers[ans.questionId] = ans.selectedOptionId || ans.textAnswer || "";
      });
      setAnswers(initialAnswers);
    }
  }, [attemptData]);


  useEffect(() => {
    const verifyStatus = async () => {
      const realStatus = await checkExamStatusAction(attemptData.id);
      if (realStatus === 'completed') {
        router.replace(`/boleta/${attemptData.id}`);
      }
    };
    verifyStatus();
  }, [attemptData.id, router]);

  // --- MANEJADOR DE RESPUESTAS ---
  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
    
    // Auto-guardado individual
    debouncedSave(questionId, val);
  };

  // Debounce manual simple
  const debouncedSave = (qId: string, val: string) => {
    setSaveStatus('saving');
    // Cancelar anterior si existe (no implementado aquí por simplicidad, pero idealmente sí)
    setTimeout(async () => {
      const result = await saveAnswerAction(attemptData.id, qId, val);
      if (result.success) setSaveStatus('saved');
      else setSaveStatus('error');
    }, 1000);
  };


  // --- NAVEGACIÓN ---
  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Finalización
  const handleFinish = async () => {
    const confirm = window.confirm("¿Estás seguro de finalizar el examen?");
    if (!confirm) return;
    setIsSubmitting(true);
    await finishExamAction(attemptData.id);
    router.push("/finished");
  };

  const handleTimeUp = async () => {
    alert("⌛ ¡El tiempo se ha agotado! Tu examen se enviará automáticamente.");
    setIsSubmitting(true);
    await finishExamAction(attemptData.id);
    router.push("/finished");
  };

  const handleKickOut = async () => {
    setIsSubmitting(true);
    alert("⛔ SISTEMA ANTI-TRAMPAS ACTIVADO ⛔\n\nHas acumulado 3 advertencias por salir de la pantalla.\n\nEl examen se cerrará automáticamente.");
    await finishExamAction(attemptData.id);
    router.push("/finished");
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      
      <ProctoringMonitor attemptId={attemptData.id} onKickOut={handleKickOut} />

      {/* HEADER */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div className="font-bold text-gray-700 text-lg truncate max-w-md">
            {attemptData.exam.title}
        </div>
        <div>
        {attemptData.exam.timeLimitMin && attemptData.exam.timeLimitMin > 0 ? (
          <ExamTimer 
             startedAt={attemptData.startedAt} 
             timeLimitMin={attemptData.exam.timeLimitMin}
             hardDeadline={attemptData.exam.endTime}
             onTimeUp={handleTimeUp}
          />
        ) : (
          <span className="text-sm font-mono bg-gray-100 text-gray-600 px-3 py-1.5 rounded border border-gray-200">
             ♾️ Sin límite de tiempo
          </span>
        )}
        </div>
      </header>

      {/* BARRA DE PROGRESO */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
            className="bg-uabc-green h-1.5 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 flex flex-col items-center w-full max-w-7xl mx-auto">
        
        {/* Info de Navegación */}
        <div className="w-full flex justify-between items-center mb-6 max-w-4xl mx-auto">
          <h2 className="text-gray-500 font-medium text-sm">
              Bloque <span className="text-gray-900 font-bold text-lg">{currentIndex + 1}</span> de {totalItems}
          </h2>
          <span className="text-xs font-bold text-uabc-gold bg-yellow-50 px-2 py-1 rounded uppercase tracking-wider border border-yellow-100">
              {currentItem.type === 'group' ? 'CASO DE ESTUDIO' : currentItem.data.type}
          </span>
        </div>

        {/* CONTENIDO DINÁMICO */}
        {currentItem.type === 'question' ? (
          // --- VISTA PREGUNTA SUELTA ---
          <div className="w-full max-w-4xl mx-auto">
             <QuestionCard
                question={currentItem.data}
                currentAnswer={answers[currentItem.data.id] || ""}
                onAnswerChange={(val) => handleAnswerChange(currentItem.data.id, val)}
                isSaving={saveStatus === 'saving'}
              />
          </div>
        ) : (
          // --- VISTA CASO DE ESTUDIO (DOS COLUMNAS) ---
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
            
            {/* Columna Izquierda: TEXTO DEL CASO */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto h-full custom-scrollbar">
               <h3 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-white pb-2 border-b">
                 {currentItem.data.title}
               </h3>
               <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                 {currentItem.data.content}
               </div>
            </div>

            {/* Columna Derecha: LISTA DE PREGUNTAS */}
            <div className="overflow-y-auto h-full pr-2 custom-scrollbar space-y-6">
               {currentItem.data.questions.map((q, idx) => (
                 <div key={q.id} className="relative">
                    <span className="absolute -left-3 top-4 text-xs font-bold text-gray-400 -rotate-90">
                      P{idx + 1}
                    </span>
                    <QuestionCard
                      question={q}
                      currentAnswer={answers[q.id] || ""}
                      onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                      isSaving={saveStatus === 'saving'}
                    />
                 </div>
               ))}
            </div>

          </div>
        )}

        {/* Botonera Inferior */}
        <div className="mt-8 flex justify-between w-full max-w-4xl mx-auto">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                currentIndex === 0 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm"
            }`}
          >
            ← Anterior
          </button>

          {currentIndex === totalItems - 1 ? (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-uabc-green text-white rounded-lg hover:bg-uabc-dark font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Examen"}
            </button>
          ) : (
            <button 
                onClick={handleNext} 
                className="px-8 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium shadow-md transition-colors"
            >
              Siguiente →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}