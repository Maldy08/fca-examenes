"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  onUploadComplete: (url: string) => void;
}

export default function ImageUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    // 1. Crear nombre único para no sobreescribir
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 2. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('exam-uploads') // <--- Asegúrate que este sea el nombre de tu bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Obtener la URL pública
      const { data } = supabase.storage
        .from('exam-uploads')
        .getPublicUrl(filePath);

      // 4. Avisar al padre que ya tenemos URL
      setPreview(data.publicUrl);
      onUploadComplete(data.publicUrl);

    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
        Imagen de Apoyo
      </label>
      
      <div className="flex items-center gap-4">
        {/* Botón de Selección */}
        <label className={`
            cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <span>{uploading ? 'Subiendo...' : '📂 Seleccionar Imagen'}</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading}
            className="hidden" 
          />
        </label>

        {/* Previsualización */}
        {preview && (
          <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-gray-100">
            <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-md">✓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}