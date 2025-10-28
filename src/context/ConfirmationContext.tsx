// src/context/ConfirmationContext.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";

/**
 * Options de prompt pour la saisie utilisateur
 */
interface PromptOptions {
    label: string;
    placeholder?: string;
}

/**
 * Options de configuration de la boîte de dialogue de confirmation
 */
export interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    prompt?: PromptOptions;
}

/**
 * Fonction de confirmation qui retourne une promesse
 * @returns string si confirmé (valeur saisie ou chaîne vide), false si annulé
 */
export type ConfirmFunction = (
    options: ConfirmationOptions,
) => Promise<string | false>;

/**
 * État interne du resolver de promesse
 */
interface PromiseResolver {
    resolve: (value: string | false) => void;
}

/**
 * Contexte de confirmation partagé
 */
const ConfirmationContext = createContext<ConfirmFunction | undefined>(
    undefined,
);

/**
 * Props du provider de confirmation
 */
interface ConfirmationProviderProps {
    children: ReactNode;
}

/**
 * Provider du contexte de confirmation
 * Permet d'afficher des dialogues de confirmation modaux avec gestion de promesses
 */
export const ConfirmationProvider = ({
    children,
}: ConfirmationProviderProps) => {
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);
    const [resolver, setResolver] = useState<PromiseResolver | null>(null);

    /**
     * Affiche une boîte de dialogue de confirmation
     * @param options - Options de configuration du dialogue
     * @returns Promise qui résout avec la valeur saisie ou false si annulé
     */
    const confirm = useCallback((options: ConfirmationOptions) => {
        return new Promise<string | false>((resolve) => {
            setOptions(options);
            setResolver({ resolve });
        });
    }, []);

    /**
     * Gère la confirmation de l'utilisateur
     * @param inputValue - Valeur saisie par l'utilisateur (optionnelle)
     */
    const handleConfirm = useCallback(
        (inputValue?: string) => {
            resolver?.resolve(inputValue ?? "");
            setOptions(null);
            setResolver(null);
        },
        [resolver],
    );

    /**
     * Gère l'annulation de l'utilisateur
     */
    const handleCancel = useCallback(() => {
        resolver?.resolve(false);
        setOptions(null);
        setResolver(null);
    }, [resolver]);

    return (
        <ConfirmationContext.Provider value={confirm}>
            {children}
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

/**
 * Hook pour accéder à la fonction de confirmation
 * @returns {ConfirmFunction} Fonction de confirmation
 * @throws {Error} Si utilisé hors d'un ConfirmationProvider
 */
export const useConfirm = (): ConfirmFunction => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error(
            "useConfirm must be used within a ConfirmationProvider",
        );
    }
    return context;
};
