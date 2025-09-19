// src/components/fields/ToggleField.tsx
"use client";

import { BooleanFieldConfig } from "../../lib/pageSchema";

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
  config: BooleanFieldConfig;
}

export const ToggleField = ({ label, value, onChange, config }: ToggleFieldProps) => {
  const falseLabel = config.falseLabel || 'Désactivé';
  const trueLabel = config.trueLabel || 'Activé';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex w-full bg-gray-200 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 text-center text-sm font-semibold p-2 rounded-md transition-all duration-200 ${
            !value ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'
          }`}
        >
          {falseLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 text-center text-sm font-semibold p-2 rounded-md transition-all duration-200 ${
            value ? 'bg-white text-gray-800 shadow' : 'bg-transparent text-gray-500'
          }`}
        >
          {trueLabel}
        </button>
      </div>
    </div>
  );
};