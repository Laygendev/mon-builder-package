// packages/builder/src/context/ConfirmationContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  prompt?: {
    label: string;
    placeholder?: string;
  };
}

// Le type de retour est maintenant `string | false`.
// `false` si l'utilisateur annule, `string` avec la valeur saisie s'il confirme.
// Si pas de prompt, la string sera vide.
type ConfirmFunction = (
  options: ConfirmationOptions
) => Promise<string | false>;

const ConfirmationContext = createContext<ConfirmFunction | undefined>(
  undefined
);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (value: string | false) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmationOptions) => {
    return new Promise<string | false>((resolve) => {
      setOptions(options);
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = (inputValue?: string) => {
    resolver?.resolve(inputValue ?? ""); // Renvoie la valeur saisie, ou une chaîne vide
    setOptions(null);
  };

  const handleCancel = () => {
    resolver?.resolve(false); // Annulé = false
    setOptions(null);
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {/* On ne rend le dialogue que si 'options' est bien défini */}
      {options && (
        <ConfirmationDialog
          isOpen={true}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          prompt={options.prompt}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmationProvider");
  }
  return context;
};
