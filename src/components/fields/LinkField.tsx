// src/components/fields/LinkField.tsx
"use client";

import { useState, useEffect } from 'react';

// Interfaces pour correspondre à la nouvelle réponse de l'API
interface ContentItem {
  name: string;
  path: string;
}
interface ContentGroup {
  id: string;
  label: string;
  items: ContentItem[];
}

interface LinkFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}

export const LinkField = ({ label, value, onChange }: LinkFieldProps) => {
  const [contentGroups, setContentGroups] = useState<ContentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/list-content');
        if (!response.ok) throw new Error("Impossible de charger le contenu");
        const data: ContentGroup[] = await response.json();
        setContentGroups(data);
      } catch (error) {
        console.error("Impossible de charger la liste des pages :", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        {isLoading ? (
          <option>Chargement...</option>
        ) : (
          <>
            <option value="">-- Sélectionnez un lien --</option>
            {/* On itère sur les groupes renvoyés par l'API */}
            {contentGroups.map(group => (
              <optgroup key={group.id} label={group.label}>
                {group.items.map(item => (
                  <option key={item.path} value={item.path}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </>
        )}
      </select>
    </div>
  );
};