"use client";

import {
    createContext,
    useState,
    useContext,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import { PageSchema, BuilderConfig } from "../lib/pageSchema";

/**
 * Type pour le chemin de section actif
 */
type ActiveSectionPath = string | null;

/**
 * Type du contexte d'édition
 */
interface EditingContextType {
    activeSectionPath: ActiveSectionPath;
    setActiveSection: (path: string) => void;
    clearActiveSection: () => void;
    pageSchema: PageSchema;
    config: BuilderConfig;
}

/**
 * Props du provider d'édition
 */
interface EditingProviderProps {
    children: ReactNode;
    schema: PageSchema;
    config: BuilderConfig;
}

/**
 * Contexte d'édition partagé
 */
const EditingContext = createContext<EditingContextType | undefined>(undefined);

/**
 * Provider du contexte d'édition
 * Gère l'état de la section active et fournit le schéma de page et la configuration
 */
export const EditingProvider = ({
    children,
    schema,
    config,
}: EditingProviderProps) => {
    const [activeSectionPath, setActiveSectionPath] =
        useState<ActiveSectionPath>(null);

    /**
     * Active une section pour l'édition
     * @param path - Chemin de la section à activer
     */
    const setActiveSection = useCallback((path: string) => {
        setActiveSectionPath(path);
    }, []);

    /**
     * Désactive la section active
     */
    const clearActiveSection = useCallback(() => {
        setActiveSectionPath(null);
    }, []);

    /**
     * Valeur mémorisée du contexte pour éviter les re-renders inutiles
     */
    const contextValue = useMemo(
        () => ({
            activeSectionPath,
            setActiveSection,
            clearActiveSection,
            pageSchema: schema,
            config,
        }),
        [
            activeSectionPath,
            setActiveSection,
            clearActiveSection,
            schema,
            config,
        ],
    );

    return (
        <EditingContext.Provider value={contextValue}>
            {children}
        </EditingContext.Provider>
    );
};

/**
 * Hook pour accéder au contexte d'édition
 * @returns {EditingContextType} Le contexte d'édition
 * @throws {Error} Si utilisé hors d'un EditingProvider
 */
export const useEditing = (): EditingContextType => {
    const context = useContext(EditingContext);
    if (context === undefined) {
        throw new Error("useEditing must be used within an EditingProvider");
    }
    return context;
};
