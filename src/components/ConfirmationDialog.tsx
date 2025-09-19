// packages/builder/src/components/ConfirmationDialog.tsx
"use client";

import { useState, useEffect } from 'react';

// ... (WarningIcon reste inchangé)

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (inputValue?: string) => void; // <-- Peut maintenant renvoyer une valeur
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  prompt?: { // <-- NOUVELLE PROP optionnelle pour afficher un champ de saisie
    label: string;
    placeholder?: string;
  };
}

export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  prompt, // <-- Récupérer la nouvelle prop
}: ConfirmationDialogProps) => {
  const [inputValue, setInputValue] = useState('');

  // Réinitialiser la valeur du champ à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirmClick = () => {
    // Si un champ est affiché mais vide, on ne fait rien
    if (prompt && !inputValue.trim()) {
      return;
    }
    onConfirm(prompt ? inputValue : undefined);
  };

  return (
    <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* ... (Fond semi-transparent inchangé) ... */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {/* ... (Icône inchangée) ... */}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                  </div>

                  {/* ===== NOUVELLE SECTION POUR LE CHAMP DE SAISIE ===== */}
                  {prompt && (
                    <div className="mt-4">
                      <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700">
                        {prompt.label}
                      </label>
                      <input
                        type="text"
                        id="prompt-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={prompt.placeholder || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  )}
                  {/* ======================================================= */}

                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:bg-gray-300"
                onClick={handleConfirmClick}
                disabled={prompt && !inputValue.trim()} // <-- Désactiver le bouton si le champ est vide
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};