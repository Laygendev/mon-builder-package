// packages/builder/src/components/fields/CollectionField.tsx
"use client";

import { useEditing } from '../../context/EditingContext';

interface CollectionFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}

export const CollectionField = ({ label, value, onChange }: CollectionFieldProps) => {
  const { config } = useEditing();
  
  // On lit directement l'objet contentTypes de la configuration
  const contentTypes = config.contentTypes || {};
  
  // On transforme l'objet en un tableau utilisable par le <select>
  const collections = Object.keys(contentTypes).map(key => ({
    id: key, // "pages", "articles", "offres"
    label: contentTypes[key].label // "Pages", "Actualités", "Offres"
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
      >
        <option value="">-- Sélectionnez un type de contenu --</option>
        {collections.map(col => (
          <option key={col.id} value={col.id}>
            {col.label}
          </option>
        ))}
      </select>
    </div>
  );
};