"use client";

import { deleteQuestionAction } from "@/actions/exam-actions";
import { useState } from "react";

export default function DeleteQuestionButton({ questionId, examId }: { questionId: string, examId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirm = window.confirm("¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.");
        if (!confirm) return;

        setIsDeleting(true);
        await deleteQuestionAction(questionId, examId);
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 p-2 transition-colors"
            title="Eliminar pregunta"
        >
            {isDeleting ? "..." : "🗑️"}
        </button>
    );
}