"use client";

import { deleteGroupAction } from "@/actions/exam-actions";
import { useState } from "react";

export default function DeleteGroupButton({ groupId, examId }: { groupId: string, examId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm("¿Estás seguro de eliminar este caso de estudio? Se borrarán también todas sus preguntas.");
    if (!confirm) return;

    setIsDeleting(true);
    await deleteGroupAction(groupId, examId);
    setIsDeleting(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
    >
      {isDeleting ? "Borrando..." : "Eliminar Caso"}
    </button>
  );
}
