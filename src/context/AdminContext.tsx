"use client";

import { createContext, useContext, ReactNode } from "react";
import { PageSchema, SiteData, BuilderConfig } from "../lib/pageSchema";

/**
 * Type du contexte d'administration
 */
interface AdminContextType {
    initialData: SiteData;
    schema: PageSchema;
    pathname: string;
    config: BuilderConfig;
}

/**
 * Props du provider AdminContext
 */
interface AdminContextProviderProps {
    value: AdminContextType;
    children: ReactNode;
}

/**
 * Contexte d'administration partagé
 */
const AdminContext = createContext<AdminContextType | undefined>(undefined);

/**
 * Provider du contexte d'administration
 * Fournit les données initiales, le schéma, le pathname et la configuration
 */
export const AdminContextProvider = ({
    value,
    children,
}: AdminContextProviderProps) => {
    return (
        <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    );
};

/**
 * Hook pour accéder au contexte d'administration
 * @throws {Error} Si utilisé hors d'un AdminContextProvider
 */
export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminContextProvider");
    }
    return context;
};
