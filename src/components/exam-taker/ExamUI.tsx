"use client";

import { useState, useEffect, useCallback } from "react";
import QuestionCard from "@/components/exam-taker/QuestionCard";

import { Exam, Question, Option, ExamAttempt } from "@prisma/client";
import { saveAnswerAction, finishExamAction } from "@/actions/student-action";
import { useRouter } from "next/navigation";


type ExamWithQuestions = ExamAttempt & {
    exam: Exam & {
        questions: (Question & { options: Option[] })[];
    };
};

interface ExamUIProps {
    attemptData: ExamWithQuestions;
}

export default function ExamUI({ attemptData }: ExamUIProps) {
    const router = useRouter(); // Inicializar router
    const questions = attemptData.exam.questions;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Inicializamos las respuestas con lo que ya venga de la BD (si recarga la página)
    // (Para este MVP iniciamos vacío, pero luego podemos pre-cargar respuestas guardadas)
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Estado de guardado: 'saved' | 'saving' | 'error'
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado para bloquear el botón

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    // --- LÓGICA DE AUTO-GUARDADO (DEBOUNCE) ---
    useEffect(() => {
        // Si no hay respuesta para la pregunta actual, no hacemos nada
        const currentAnswer = answers[currentQuestion.id];
        if (currentAnswer === undefined) return;

        setSaveStatus('saving');

        // Esperamos 1000ms (1 segundo) después de que el usuario deje de escribir
        const timerId = setTimeout(async () => {
            const result = await saveAnswerAction(
                attemptData.id,
                currentQuestion.id,
                currentAnswer
            );

            if (result.success) {
                setSaveStatus('saved');
            } else {
                setSaveStatus('error');
            }
        }, 1000);

        // Si el usuario escribe antes de que pase el segundo, cancelamos el timer anterior
        return () => clearTimeout(timerId);
    }, [answers[currentQuestion.id], currentQuestion.id, attemptData.id]); // Dependencias


    const handleAnswerChange = (val: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: val,
        }));
    };

    const handleFinish = async () => {
        const confirm = window.confirm("¿Estás seguro de finalizar el examen? No podrás cambiar tus respuestas.");
        if (!confirm) return;

        setIsSubmitting(true);

        // 1. Aseguramos que la última respuesta se guarde (por si acaso)
        if (answers[currentQuestion.id]) {
            await saveAnswerAction(attemptData.id, currentQuestion.id, answers[currentQuestion.id]);
        }

        // 2. Llamamos a la acción de finalizar
        const result = await finishExamAction(attemptData.id);

        if (result.success) {
            router.push(`/student/finished`); // Redirigimos
        } else {
            alert("Hubo un error al finalizar. Intenta de nuevo.");
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="font-bold text-gray-700">{attemptData.exam.title}</div>
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
                    {/* Aquí luego pondremos el Timer real */}
                    En progreso
                </div>
            </header>

            {/* Barra de Progreso */}
            <div className="w-full bg-gray-200 h-1.5">
                <div className="bg-blue-600 h-1.5 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <main className="flex-1 p-8 flex flex-col items-center max-w-4xl mx-auto w-full">
                <div className="w-full flex justify-between mb-6 text-sm text-gray-500">
                    <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
                    <span className="uppercase">{currentQuestion.type.replace('_', ' ')}</span>
                </div>

                <QuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    currentAnswer={answers[currentQuestion.id] || ""}
                    onAnswerChange={handleAnswerChange}
                    isSaving={saveStatus === 'saving'} // Pasamos el estado real
                />

                {/* Botones */}
                <div className="w-full flex justify-between mt-8 max-w-3xl">
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
                            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? 'Finalizando...' : 'Finalizar Examen'}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Siguiente →
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}