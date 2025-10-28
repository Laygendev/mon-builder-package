// src/components/AdminProvider.tsx
"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { usePathname, notFound } from "next/navigation";
import { AdminContextProvider } from "../context/AdminContext";
import { PageSchema, SiteData, BuilderConfig } from "../lib/pageSchema";

/**
 * Props du composant AdminProvider
 */
interface AdminProviderProps {
    config: BuilderConfig;
    children: ReactNode;
}

/**
 * État de chargement des données
 */
interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

/**
 * Réponse de l'API de récupération des données de page
 */
interface PageDataResponse {
    initialData: SiteData;
    schema: PageSchema;
}

/**
 * AdminProvider - Composant racine qui charge les données de la page
 * et fournit le contexte d'administration à tous les composants enfants
 *
 * @param config - Configuration de l'éditeur
 * @param children - Composants enfants à rendre
 */
export function AdminProvider({ config, children }: AdminProviderProps) {
    const rawPathname = usePathname();

    // Normalise le pathname en retirant le préfixe /admin
    const pathname = rawPathname.replace(/^\/admin/, "") || "/";

    const [initialData, setInitialData] = useState<SiteData | null>(null);
    const [schema, setSchema] = useState<PageSchema | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null,
    });

    /**
     * Charge les données de la page depuis l'API
     */
    const fetchData = useCallback(async () => {
        setLoadingState({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `/api/get-page-data?pathname=${encodeURIComponent(pathname)}`,
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("PAGE_NOT_FOUND");
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: PageDataResponse = await response.json();

            if (!data.initialData || !data.schema) {
                throw new Error("Données invalides reçues de l'API");
            }

            setInitialData(data.initialData);
            setSchema(data.schema);
            setLoadingState({ isLoading: false, error: null });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Erreur inconnue";

            if (errorMessage === "PAGE_NOT_FOUND") {
                // Laisse Next.js gérer la 404
                setLoadingState({ isLoading: false, error: null });
                setInitialData(null);
            } else {
                setLoadingState({
                    isLoading: false,
                    error: errorMessage,
                });
            }
        }
    }, [pathname]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Écran de chargement
    if (loadingState.isLoading) {
        return (
            <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Chargement de l&apos;éditeur...
                    </p>
                </div>
            </div>
        );
    }

    // Écran d'erreur
    if (loadingState.error) {
        return (
            <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
                <div className="text-center max-w-md p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Erreur de chargement
                    </h1>
                    <p className="text-gray-600 mb-4">{loadingState.error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Page non trouvée
    if (!initialData || !schema) {
        return notFound();
    }

    // Rendu normal avec le contexte d'administration
    return (
        <AdminContextProvider value={{ initialData, schema, pathname, config }}>
            {children}
        </AdminContextProvider>
    );
}
