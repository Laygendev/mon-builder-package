// src/components/AdminToolbar.tsx
"use client";

import { ComponentType, useState } from "react";
import { ManagementPanel } from "./ManagementPanel";
import { useAdmin } from "../context/AdminContext";

interface AdminToolbarProps {
  UserToolbarComponent?: ComponentType; // Prop optionnelle pour le composant utilisateur
}

export const AdminToolbar = ({ UserToolbarComponent }: AdminToolbarProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { config } = useAdmin(); // <-- Récupère la config globale

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-[60] hover:bg-gray-700 transition-colors"
        title="Gérer le site"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <div className="fixed bottom-6 left-6 z-[60]">
        {UserToolbarComponent && <UserToolbarComponent />}
      </div>

      <ManagementPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        config={config}
      />
    </>
  );
};
