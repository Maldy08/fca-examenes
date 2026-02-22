"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinExamAction } from "@/actions/join-action";

// Componente separado para el botón para poder usar useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-uabc-button-green text-white py-3 rounded-lg font-bold hover:bg-uabc-green transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-uabc-button-green/20"
    >
      {pending ? "Verificando..." : "Comenzar Examen →"}
    </button>
  );
}

export default function JoinExamForm() {
  // useActionState reemplaza a useFormState en React 19
  const [state, formAction] = useActionState(joinExamAction, { success: false, error: undefined });

  return (
    <form action={formAction} className="space-y-4">
      {state.success === false && state.error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
          ⚠️ {state.error}
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

      <SubmitButton />
    </form>
  );
}