"use client";

import { useState } from "react";
import { createGroupAction } from "@/actions/exam-actions";

export default function AddCaseStudyForm({ examId }: { examId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await createGroupAction(examId, title, content);
    
    // Reset
    setTitle("");
    setContent("");
    setIsSaving(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Agregar Caso de Estudio
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Nuevo Caso de Estudio</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕ Cancelar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título del Caso</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Ej. Caso Uber: Expansión Global"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contenido / Texto</label>
          <textarea 
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            placeholder="Pega aquí el texto completo del caso..."
          />
        </div>

        <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-black transition-colors disabled:opacity-50"
        >
            {isSaving ? "Guardando..." : "Crear Caso de Estudio"}
        </button>
      </form>
    </div>
  );
}
