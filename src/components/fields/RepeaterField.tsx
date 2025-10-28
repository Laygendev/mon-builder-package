// src/components/fields/RepeaterField.tsx
"use client";

import { useCallback } from "react";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrayFieldConfig, FieldConfig } from "../../lib/pageSchema";

/**
 * Structure d'un élément de tableau
 */
interface ArrayItem {
    id: string;
    [key: string]: unknown;
}

/**
 * Props pour un élément triable
 */
interface SortableItemProps {
    item: ArrayItem;
    index: number;
    onSelect: () => void;
    onDelete: () => void;
}

/**
 * SortableItem - Composant pour une seule ligne déplaçable dans la liste
 */
const SortableItem = ({
    item,
    index,
    onSelect,
    onDelete,
}: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    /**
     * Détermine le label à afficher pour l'élément
     */
    const getItemLabel = (): string => {
        if (typeof item.label === "string" && item.label) return item.label;
        if (typeof item.title === "string" && item.title) return item.title;
        return `Élément #${index + 1}`;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-full bg-white border border-gray-300 rounded-md p-2 text-left"
        >
            <div className="flex justify-between items-center">
                {/* Poignée pour le drag-and-drop */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-2 text-gray-400 hover:text-gray-600"
                    title="Réordonner"
                    type="button"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Bouton principal pour éditer l'élément */}
                <button
                    onClick={onSelect}
                    className="flex-grow text-left mx-2 text-gray-700 hover:text-blue-600 truncate"
                    type="button"
                >
                    {getItemLabel()}
                </button>

                {/* Bouton pour supprimer l'élément */}
                <button
                    onClick={onDelete}
                    className="text-red-500 text-xl p-1 font-light hover:text-red-700"
                    title="Supprimer"
                    type="button"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

/**
 * Props du composant RepeaterField
 */
interface RepeaterFieldProps {
    label: string;
    value: ArrayItem[];
    config: ArrayFieldConfig;
    onChange: (newValue: ArrayItem[]) => void;
    onItemClick: (index: number, item: ArrayItem) => void;
}

/**
 * RepeaterField - Composant pour gérer un tableau d'objets avec drag-and-drop
 * Permet d'ajouter, supprimer, réordonner et éditer des éléments dans un tableau
 *
 * @param label - Label du champ
 * @param value - Tableau d'objets actuel
 * @param config - Configuration du champ (définit les sous-champs)
 * @param onChange - Fonction appelée lors de la modification du tableau
 * @param onItemClick - Fonction appelée lors du clic sur un élément pour l'éditer
 */
export const RepeaterField = ({
    label,
    value = [],
    config,
    onChange,
    onItemClick,
}: RepeaterFieldProps) => {
    const sensors = useSensors(useSensor(PointerSensor));

    /**
     * Gère la fin du drag and drop
     */
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = value.findIndex((item) => item.id === active.id);
            const newIndex = value.findIndex((item) => item.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                onChange(arrayMove(value, oldIndex, newIndex));
            }
        },
        [value, onChange],
    );

    /**
     * Supprime un élément du tableau
     */
    const handleDelete = useCallback(
        (index: number) => {
            onChange(value.filter((_, i) => i !== index));
        },
        [value, onChange],
    );

    /**
     * Ajoute un nouvel élément au tableau
     */
    const handleAdd = useCallback(() => {
        const newItem: ArrayItem = { id: `item-${Date.now()}` };

        // Pré-remplir avec des valeurs par défaut si elles existent dans le schéma
        Object.values(config.itemFields).forEach((field: FieldConfig) => {
            if ("defaultData" in field && field.defaultData !== undefined) {
                newItem[field.name] = field.defaultData;
            }
        });

        onChange([...value, newItem]);
    }, [value, config.itemFields, onChange]);

    return (
        <div className="space-y-3">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={value.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {value.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                item={item}
                                index={index}
                                onSelect={() => onItemClick(index, item)}
                                onDelete={() => handleDelete(index)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {value.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm border border-dashed border-gray-300 rounded">
                    Aucun élément. Cliquez sur le bouton ci-dessous pour en
                    ajouter.
                </div>
            )}

            <button
                onClick={handleAdd}
                className="w-full text-sm p-2 bg-gray-100 hover:bg-gray-200 rounded"
                type="button"
            >
                + Ajouter un élément à &ldquo;{label}&rdquo;
            </button>
        </div>
    );
};
