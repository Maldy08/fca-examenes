"use client";

import { useState } from "react";
import { joinExamAction } from "@/actions/join-action";

export default function JoinExamForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    // Llamamos a la Server Action
    const result = await joinExamAction(formData);

    // Si la acción retorna algo (solo retorna si hay error, si no, hace redirect)
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Si no hay error, el redirect del server action nos llevará al examen
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
        <input
          name="fullName"
          type="text"
          required
          placeholder="Ej. Juan Pérez"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
        <input
          name="email"
          type="email"
          required
          placeholder="juan.perez@uabc.edu.mx"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Código del Examen</label>
        <input
          name="code"
          type="text"
          required
          placeholder="Ej. DB2025"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uabc-button-green outline-none uppercase tracking-widest font-mono text-center"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-uabc-button-green text-white py-3 rounded-lg font-bold hover:bg-uabc-green transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-uabc-button-green/20"
      >
        {isLoading ? "Verificando..." : "Comenzar Examen →"}
      </button>
    </form>
  );
}