import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import CreateExamForm from "@/components/admin/CreateExamForm";

export default async function CreateExamPage() {
  await requireAdminUser();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-uabc-button-green mb-6 block">
        ← Cancelar y volver
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Examen</h1>

        <CreateExamForm />
      </div>
    </div>
  );
}
