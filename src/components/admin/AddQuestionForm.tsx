"use client";

import { useState } from "react";
import { addQuestionAction } from "@/actions/exam-actions";
import { QuestionType } from "@prisma/client";
import ImageUpload from "./ImageUpload";

export default function AddQuestionForm({ examId, groupId }: { examId: string, groupId?: string }) {
    const [type, setType] = useState<QuestionType>("MULTIPLE_CHOICE");
    const [content, setContent] = useState("");
    const [points, setPoints] = useState(10);

    // Estado para opciones (Solo si es Multiple Choice)
    const [options, setOptions] = useState([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    const [isSaving, setIsSaving] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Preparamos los datos
        const optionsData = type === "MULTIPLE_CHOICE" ? options : undefined;

        await addQuestionAction(examId, type, content, points, optionsData, groupId, imageUrl);

        // Reset del formulario
        setContent("");
        setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
        setIsSaving(false);
        setImageUrl("");
        alert("Pregunta agregada correctamente");
    };

    const handleOptionChange = (idx: number, field: 'text' | 'isCorrect', value: any) => {
        const newOptions = [...options];
        // @ts-ignore
        newOptions[idx][field] = value;
        setOptions(newOptions);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Tipo y Puntos */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Pregunta</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as QuestionType)}
                            className="w-full p-2 border rounded bg-white"
                        >
                            <option value="MULTIPLE_CHOICE">Opción Múltiple</option>
                            <option value="OPEN_TEXT">Texto Abierto</option>
                            <option value="CODE_SQL">Código SQL</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Puntaje</label>
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Enunciado */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pregunta</label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Ej. Escribe una consulta que..."
                    />
                </div>

                {/* Opciones (Condicional) */}
                {type === "MULTIPLE_CHOICE" && (
                    <div className="bg-white p-4 rounded border">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Opciones de Respuesta</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                <input
                                    type="radio"
                                    name="correctOption"
                                    checked={opt.isCorrect}
                                    onChange={() => {
                                        // Resetear otros y marcar este
                                        const newOpts = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                                        setOptions(newOpts);
                                    }}
                                />
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                                    placeholder={`Opción ${idx + 1}`}
                                    className="flex-1 p-2 border rounded text-sm"
                                    required
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setOptions([...options, { text: "", isCorrect: false }])}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            + Agregar otra opción
                        </button>
                    </div>
                )}

                <ImageUpload
                    onUploadComplete={(url) => {
                        setImageUrl(url); // Guardamos la URL que nos devuelve Supabase
                    }}
                />

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                    {isSaving ? "Guardando..." : "Agregar Pregunta al Examen"}
                </button>

            </form>
        </div>
    );
}