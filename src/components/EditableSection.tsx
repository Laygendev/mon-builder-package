// src/components/EditableSection.tsx
"use client";

import React, { ReactNode, useCallback, memo } from "react";
import { useEditing } from "../context/EditingContext";

/**
 * Props du composant EditableSection
 */
interface EditableSectionProps {
    children: ReactNode;
    path: string;
    onSelect: () => void;
    className?: string;
}

/**
 * EditableSection - Composant wrapper qui rend une section éditable
 * Affiche un contour et un indicateur visuel lorsque la section est active ou survolée
 *
 * @param children - Contenu de la section
 * @param path - Chemin unique de la section dans les données
 * @param onSelect - Fonction appelée lors de la sélection de la section
 * @param className - Classes CSS additionnelles
 */
const EditableSectionComponent = ({
    children,
    path,
    onSelect,
    className = "",
}: EditableSectionProps) => {
    const { activeSectionPath } = useEditing();
    const isActive = activeSectionPath === path;

    /**
     * Gère le clic sur la section
     * Empêche la propagation pour éviter les conflits avec les sections imbriquées
     */
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelect();
        },
        [onSelect],
    );

    return (
        <div
            onClick={handleClick}
            className={`
                relative
                cursor-pointer
                transition-all
                ${
                    isActive
                        ? "outline outline-2 outline-blue-500 outline-offset-2"
                        : "hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400"
                }
                ${className}
            `}
            title="Cliquez pour éditer cette section"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect();
                }
            }}
        >
            {isActive && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-lg">
                    ✏️ Édition
                </div>
            )}
            {children}
        </div>
    );
};

/**
 * Export mémorisé pour éviter les re-renders inutiles
 */
export const EditableSection = memo(EditableSectionComponent);
