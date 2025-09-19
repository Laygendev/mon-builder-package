"use client";

import React, { ReactNode } from 'react';
import { useEditing } from '../context/EditingContext';


interface EditableSectionProps {
  children: ReactNode;
  path: string;
  onSelect: () => void;
  className?: string;
}

export const EditableSection = ({ children, path, onSelect, className }: EditableSectionProps) => {
  const { setActiveSection, activeSectionPath } = useEditing();
  const isActive = activeSectionPath === path;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative cursor-pointer transition-all ${isActive ? 'outline outline-2 outline-blue-500 outline-offset-2' : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400'} ${className}`}
      title={`Cliquez pour éditer cette section`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
          Édition
        </div>
      )}
      {children}
    </div>
  );
};