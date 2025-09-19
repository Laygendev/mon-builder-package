// src/components/StructurePanel.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditing } from "../context/EditingContext";

// --- Le composant pour un seul bloc déplaçable dans la liste ---
const SortableBlockItem = ({
  id,
  label,
  onDelete,
  onSelect,
}: {
  id: string;
  label: string;
  onDelete: () => void;
  onSelect: () => void;
}) => {
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
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-gray-400 hover:text-white"
          title="Réordonner"
        >
          ⠿
        </button>
        <button onClick={onSelect} className="ml-2 text-left hover:underline">
          {label}
        </button>
      </div>
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-400 text-xs p-1"
      >
        Supprimer
      </button>
    </div>
  );
};

// --- Le panneau principal ---
interface StructurePanelProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: { id: string; type: string; data: any }[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  onDelete: (index: number) => void;
  onAdd: (blockType: string) => void;
  onSelectBlock: (index: number) => void;
  onSelectGlobal: (sectionType: string) => void;
}

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
  const [activeTab, setActiveTab] = useState<"page" | "globals">("page");
  const [isAdding, setIsAdding] = useState(false);
  const { pageSchema, config } = useEditing();
  const globalSchemas = config.globalSchemas;
  const pageFields = pageSchema.pageFields || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-gray-800 text-white shadow-2xl z-50 flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Structure de la Page</h2>
        <button onClick={onClose} className="text-2xl">
          &times;
        </button>
      </div>

      <div className="flex border-b border-gray-600 mb-4">
        <button
          onClick={() => setActiveTab("page")}
          className={`flex-1 p-2 text-sm ${
            activeTab === "page" ? "bg-gray-700" : ""
          }`}
        >
          Page
        </button>
        <button
          onClick={() => setActiveTab("globals")}
          className={`flex-1 p-2 text-sm ${
            activeTab === "globals" ? "bg-gray-700" : ""
          }`}
        >
          Global
        </button>
      </div>

      {activeTab === "page" && (
        <>
          {pageFields.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-600">
              <h3 className="font-semibold mb-2 text-sm text-gray-300">
                Paramètres de la Page
              </h3>
              <div className="space-y-2">
                {pageFields.map((field: any) => (
                  <button
                    key={field.name}
                    // On ouvre le panneau d'édition avec un chemin vers `page.seo`
                    onClick={() => onSelectGlobal(`page.${field.name}`)}
                    className="w-full text-left bg-gray-700 p-2 rounded hover:underline"
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <h3 className="font-semibold mb-2 text-sm text-gray-300">
            Contenu de la Page
          </h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex-grow overflow-y-auto space-y-2">
                {blocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    id={block.id}
                    label={pageSchema.blocks[block.type]?.label || block.type}
                    onDelete={() => onDelete(index)}
                    onSelect={() => onSelectBlock(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-4 pt-4 border-t border-gray-600">
            {isAdding ? (
              <div>
                {Object.keys(pageSchema.blocks).map((blockType) => (
                  <button
                    key={blockType}
                    onClick={() => {
                      onAdd(blockType);
                      setIsAdding(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-600"
                  >
                    {pageSchema.blocks[blockType].label}
                  </button>
                ))}
                <button
                  onClick={() => setIsAdding(false)}
                  className="w-full text-left p-2 mt-2 text-xs text-gray-400"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded text-sm"
              >
                + Ajouter un Bloc
              </button>
            )}
          </div>
        </>
      )}

      {activeTab === "globals" && (
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Contenus du Site</h3>
          {Object.keys(globalSchemas).map((key) => (
            <button
              key={key}
              onClick={() => onSelectGlobal(key)} // Ouvre l'édition pour ce contenu global
              className="w-full text-left bg-gray-700 p-2 rounded hover:underline"
            >
              {globalSchemas[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
