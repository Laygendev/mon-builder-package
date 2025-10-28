// src/components/StructurePanel.tsx
"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditing } from "../context/EditingContext";
import { BlockData, FieldConfig } from "../lib/pageSchema";

/**
 * Props pour un élément de bloc triable
 */
interface SortableBlockItemProps {
    id: string;
    label: string;
    onDelete: () => void;
    onSelect: () => void;
}

/**
 * SortableBlockItem - Composant pour un seul bloc déplaçable dans la liste
 */
const SortableBlockItem = ({
    id,
    label,
    onDelete,
    onSelect,
}: SortableBlockItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center bg-gray-700 p-2 rounded justify-between"
        >
            <div className="flex items-center flex-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-1 text-gray-400 hover:text-white"
                    title="Réordonner"
                    type="button"
                >
                    ⠿
                </button>
                <button
                    onClick={onSelect}
                    className="ml-2 text-left hover:underline flex-1"
                    type="button"
                >
                    {label}
                </button>
            </div>
            <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-400 text-xs p-1"
                title="Supprimer"
                type="button"
            >
                Supprimer
            </button>
        </div>
    );
};

/**
 * Type d'onglet actif
 */
type ActiveTab = "page" | "globals";

/**
 * Props du composant StructurePanel
 */
interface StructurePanelProps {
    isOpen: boolean;
    onClose: () => void;
    blocks: BlockData[];
    onReorder: (oldIndex: number, newIndex: number) => void;
    onDelete: (index: number) => void;
    onAdd: (blockType: string) => void;
    onSelectBlock: (index: number) => void;
    onSelectGlobal: (sectionType: string) => void;
}

/**
 * StructurePanel - Panneau de gestion de la structure de la page
 * Permet d'ajouter, supprimer, réorganiser les blocs et d'accéder aux sections globales
 */
export const StructurePanel = ({
    isOpen,
    onClose,
    blocks,
    onReorder,
    onDelete,
    onAdd,
    onSelectBlock,
    onSelectGlobal,
}: StructurePanelProps) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("page");
    const [isAdding, setIsAdding] = useState(false);
    const { pageSchema, config } = useEditing();
    const globalSchemas = config.globalSchemas;
    const pageFields = pageSchema.pageFields || [];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    /**
     * Gère la fin du drag and drop
     */
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder(oldIndex, newIndex);
            }
        },
        [blocks, onReorder],
    );

    /**
     * Gère l'ajout d'un bloc
     */
    const handleAddBlock = useCallback(
        (blockType: string) => {
            onAdd(blockType);
            setIsAdding(false);
        },
        [onAdd],
    );

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-screen w-96 bg-gray-800 text-white shadow-2xl z-50 flex flex-col p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Structure de la Page</h2>
                <button
                    onClick={onClose}
                    className="text-2xl hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
                    title="Fermer"
                    type="button"
                >
                    &times;
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-600 mb-4">
                <button
                    onClick={() => setActiveTab("page")}
                    className={`flex-1 p-2 text-sm ${
                        activeTab === "page" ? "bg-gray-700" : ""
                    }`}
                    type="button"
                >
                    Page
                </button>
                <button
                    onClick={() => setActiveTab("globals")}
                    className={`flex-1 p-2 text-sm ${
                        activeTab === "globals" ? "bg-gray-700" : ""
                    }`}
                    type="button"
                >
                    Global
                </button>
            </div>

            {/* Page Tab Content */}
            {activeTab === "page" && (
                <>
                    {/* Paramètres de la page */}
                    {pageFields.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-600">
                            <h3 className="font-semibold mb-2 text-sm text-gray-300">
                                Paramètres de la Page
                            </h3>
                            <div className="space-y-2">
                                {pageFields.map((field: FieldConfig) => (
                                    <button
                                        key={field.name}
                                        onClick={() =>
                                            onSelectGlobal(`page.${field.name}`)
                                        }
                                        className="w-full text-left bg-gray-700 p-2 rounded hover:bg-gray-600"
                                        type="button"
                                    >
                                        {field.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contenu de la page */}
                    <h3 className="font-semibold mb-2 text-sm text-gray-300">
                        Contenu de la Page
                    </h3>

                    {/* Liste des blocs avec drag and drop */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map((b) => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex-grow overflow-y-auto space-y-2 mb-4">
                                {blocks.length > 0 ? (
                                    blocks.map((block, index) => (
                                        <SortableBlockItem
                                            key={block.id}
                                            id={block.id}
                                            label={
                                                pageSchema.blocks[block.type]
                                                    ?.label || block.type
                                            }
                                            onDelete={() => onDelete(index)}
                                            onSelect={() =>
                                                onSelectBlock(index)
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        Aucun bloc. Ajoutez-en un ci-dessous.
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Bouton d'ajout de bloc */}
                    <div className="mt-auto pt-4 border-t border-gray-600">
                        {isAdding ? (
                            <div className="space-y-2">
                                <div className="text-xs text-gray-400 mb-2">
                                    Sélectionnez un type de bloc :
                                </div>
                                {Object.keys(pageSchema.blocks).map(
                                    (blockType) => (
                                        <button
                                            key={blockType}
                                            onClick={() =>
                                                handleAddBlock(blockType)
                                            }
                                            className="w-full text-left p-2 rounded hover:bg-gray-600 text-sm"
                                            type="button"
                                        >
                                            {pageSchema.blocks[blockType].label}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="w-full text-left p-2 mt-2 text-xs text-gray-400 hover:text-white"
                                    type="button"
                                >
                                    Annuler
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded text-sm"
                                type="button"
                            >
                                + Ajouter un Bloc
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Globals Tab Content */}
            {activeTab === "globals" && (
                <div className="space-y-2">
                    <h3 className="font-semibold mb-2">Contenus du Site</h3>
                    {Object.keys(globalSchemas).length > 0 ? (
                        Object.keys(globalSchemas).map((key) => (
                            <button
                                key={key}
                                onClick={() => onSelectGlobal(key)}
                                className="w-full text-left bg-gray-700 p-2 rounded hover:bg-gray-600"
                                type="button"
                            >
                                {globalSchemas[key].label}
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Aucune section globale configurée
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
