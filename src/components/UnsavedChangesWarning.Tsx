// packages/builder/src/components/UnsavedChangesWarning.tsx
"use client";
import { useEffect } from 'react';

export const UnsavedChangesWarning = ({ isDirty }: { isDirty: boolean }) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        // La plupart des navigateurs modernes affichent un message générique
        // et ignorent la chaîne de caractères retournée, mais elle est requise.
        event.returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]); // L'effet se met à jour si `isDirty` change

  return null; // Ce composant ne rend rien de visible
};