"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useNotification } from '../../context/NotificationContext';

interface ImageFieldProps {
  label: string;
  value: string; // L'URL de l'image
  onChange: (newValue: string) => void;
}

export const ImageField = ({ label, value, onChange }: ImageFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('L\'upload a échoué.');
      }

      const result = await response.json();
      onChange(result.filePath); // Met à jour le PageBuilder avec la nouvelle URL

    } catch (error) {
      console.error(error);
      showNotification('Erreur lors de l\'upload de l\'image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="w-full aspect-video relative bg-gray-100 rounded-md overflow-hidden border">
        {value ? (
          <Image src={value} alt="Aperçu" fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">Aucune image</div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif, image/webp"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
        >
          {isUploading ? 'Chargement...' : 'Changer l\'image'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')} // Vide la valeur
            className="text-sm text-red-600 hover:text-red-800"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};