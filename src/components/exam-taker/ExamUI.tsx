"use client";

import { useState, useEffect } from "react";
import QuestionCard from "@/components/exam-taker/QuestionCard";

import { useRouter } from "next/navigation";


// Importar tipos generados por Prisma
import { Exam, Question, Option, ExamAttempt } from "@prisma/client";
import { saveAnswerAction, finishExamAction } from "@/actions/student-action";

import ProctoringMonitor from "./ProctoringMonitor";

type ExamWithQuestions = ExamAttempt & {
  exam: Exam & {
    questions: (Question & { options: Option[] })[];
  };
};

interface ExamUIProps {
  attemptData: ExamWithQuestions;
}

export default function ExamUI({ attemptData }: ExamUIProps) {
  // ---------------------------------------------------------
  // CORRECCIÓN AQUÍ: Usamos attemptData, NO MOCK_QUESTIONS
  // ---------------------------------------------------------
  const questions = attemptData.exam.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para el botón finalizar
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // --- LÓGICA DE AUTO-GUARDADO ---
  useEffect(() => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentAnswer === undefined) return;

    setSaveStatus('saving');

    const timerId = setTimeout(async () => {
      const result = await saveAnswerAction(
        attemptData.id,
        currentQuestion.id,
        currentAnswer
      );

      if (result.success) setSaveStatus('saved');
      else setSaveStatus('error');
    }, 1000);

    return () => clearTimeout(timerId);
  }, [answers, currentQuestion.id, attemptData.id]);


  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = async () => {
    const confirm = window.confirm("¿Finalizar examen?");
    if (!confirm) return;

    setIsSubmitting(true);
    // Guardar última respuesta por seguridad
    if (answers[currentQuestion.id]) {
      await saveAnswerAction(attemptData.id, currentQuestion.id, answers[currentQuestion.id]);
    }

    await finishExamAction(attemptData.id);
    router.push("/student/finished");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      <ProctoringMonitor attemptId={attemptData.id} />

      {/* Header */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="font-bold text-gray-700">{attemptData.exam.title}</div>
        <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
          En Progreso
        </div>
      </header>

      {/* Barra */}
      <div className="w-full bg-gray-200 h-1.5">
        <div className="bg-uabc-button-green h-1.5 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="flex-1 p-8 flex flex-col items-center max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pregunta {currentIndex + 1} de {questions.length}</h2>
          {/* Assuming formatTime and timeLeft are defined elsewhere or will be added */}
          {/* <div className="bg-uabc-button-green/10 text-uabc-button-green px-4 py-2 rounded-full font-mono font-bold">
            ⏱ {formatTime(timeLeft)}
          </div> */}
        </div>

        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion} // Aquí pasamos la pregunta real (con type MULTIPLE_CHOICE)
          currentAnswer={answers[currentQuestion.id] || ""}
          onAnswerChange={handleAnswerChange}
          isSaving={saveStatus === 'saving'}
        />

        <div className="mt-8 flex justify-between w-full max-w-3xl">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-6 py-2 rounded-lg ${currentIndex === 0 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-50 border"}`}
          >
            ← Anterior
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-8 py-2 bg-uabc-button-green text-white rounded-lg hover:bg-uabc-green font-bold shadow-lg shadow-uabc-button-green/20"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Examen"}
            </button>
          ) : (
            <button onClick={handleNext} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
              Siguiente →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}