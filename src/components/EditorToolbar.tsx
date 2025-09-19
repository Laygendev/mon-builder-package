// src/components/EditorToolbar.tsx
"use client";

interface EditorToolbarProps {
  onToggleStructure: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean; // <-- NOUVELLE PROP
}

export const EditorToolbar = ({ onToggleStructure, onSave, isSaving, isDirty }: EditorToolbarProps) => {
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-2 flex items-center gap-2 z-50">
      <button 
        onClick={onToggleStructure} 
        className="p-2 text-gray-600 hover:bg-gray-100 rounded" 
        title="Gérer la structure"
      >
        {/* Icône de liste */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
      </button>

      <div className="w-px h-6 bg-gray-200"></div>

      <button
        onClick={onSave}
        disabled={isSaving || !isDirty}
        className={`px-4 py-2 text-sm text-white rounded transition-colors disabled:cursor-not-allowed ${
          isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
        } ${isSaving ? 'bg-gray-400' : ''}`} 
      >
        {isSaving ? '...' : 'Sauvegarder'}
        {isDirty && <span className="ml-2 w-2 h-2 bg-yellow-300 rounded-full inline-block animate-pulse"></span>}
      </button>
    </div>
  );
};