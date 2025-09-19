// src/components/fields/RepeaterField.tsx
"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrayFieldConfig } from './../../lib/pageSchema';

// --- Le composant pour une seule ligne déplaçable dans la liste ---
const SortableItem = ({ item, index, onSelect, onDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="w-full bg-white border border-gray-300 rounded-md p-2 text-left">
      <div className="flex justify-between items-center">
        {/* Poignée pour le drag-and-drop */}
        <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-400 hover:text-gray-600" title="Réordonner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        {/* Bouton principal pour éditer l'élément */}
        <button onClick={onSelect} className="flex-grow text-left mx-2 text-gray-700 hover:text-blue-600 truncate">
          {item.label || item.title || `Élément #${index + 1}`}
        </button>
        
        {/* Bouton pour supprimer l'élément */}
        <button onClick={onDelete} className="text-red-500 text-xl p-1 font-light hover:text-red-700" title="Supprimer">
          &times;
        </button>
      </div>
    </div>
  );
};


// --- Le composant principal `RepeaterField` ---
interface RepeaterFieldProps {
  label: string;
  value: any[]; // Le tableau d'objets (ex: menuItems)
  config: ArrayFieldConfig;
  onChange: (newValue: any[]) => void; // Pour mettre à jour le tableau entier
  onItemClick: (index: number, item: any) => void; // Pour signaler au panel de "rentrer"
}

export const RepeaterField = ({ label, value = [], config, onChange, onItemClick }: RepeaterFieldProps) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = value.findIndex((item: any) => item.id === active.id);
      const newIndex = value.findIndex((item: any) => item.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    const newItem: any = { id: `item-${Date.now()}` };
    // Pré-remplir avec des valeurs par défaut si elles existent dans le schéma
    Object.values(config.itemFields).forEach((field: any) => {
        if(field.defaultData) {
            newItem[field.name] = field.defaultData;
        }
    });
    onChange([...value, newItem]);
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {value.map((item: any, index: number) => (
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
      <button onClick={handleAdd} className="w-full text-sm p-2 bg-gray-100 hover:bg-gray-200 rounded">
        + Ajouter un élément à "{label}"
      </button>
    </div>
  );
};