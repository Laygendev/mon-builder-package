// src/components/EditingPanel.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { get } from "lodash";
import {
    PageSchema,
    FieldConfig,
    SectionConfig,
    SiteData,
} from "../lib/pageSchema";
import {
    RepeaterField,
    LinkField,
    ImageField,
    ToggleField,
    RichTextField,
    CollectionField,
} from "./fields";

/**
 * Représente un élément du fil d'Ariane de navigation
 */
interface Breadcrumb {
    path: string;
    label: string;
    config: SectionConfig | FieldConfig;
}

/**
 * Props du composant EditingPanel
 */
interface EditingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeSectionPath: string | null;
    currentPageData: SiteData;
    onUpdate: (path: string, value: unknown) => void;
    schema: PageSchema & { [key: string]: SectionConfig };
}

/**
 * Props du composant FieldRenderer
 */
interface FieldRendererProps {
    config: SectionConfig | FieldConfig;
    data: Record<string, unknown>;
    path: string;
    onUpdate: (path: string, value: unknown) => void;
    onDrillDown: (
        fieldName: string,
        newConfig: FieldConfig,
        index?: number,
    ) => void;
}

/**
 * EditingPanel - Panneau latéral d'édition des champs
 * Affiche un formulaire dynamique basé sur le schéma de la section active
 * Supporte la navigation hiérarchique avec un fil d'Ariane
 *
 * @param isOpen - Indique si le panneau est ouvert
 * @param onClose - Fonction appelée lors de la fermeture du panneau
 * @param activeSectionPath - Chemin de la section actuellement éditée
 * @param currentPageData - Données complètes de la page
 * @param onUpdate - Fonction appelée lors de la modification d'un champ
 * @param schema - Schéma complet de la page
 */
export const EditingPanel = ({
    isOpen,
    onClose,
    activeSectionPath,
    currentPageData,
    onUpdate,
    schema,
}: EditingPanelProps) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

    /**
     * Construit le fil d'Ariane initial basé sur le chemin de la section active
     */
    useEffect(() => {
        if (!activeSectionPath) {
            setBreadcrumbs([]);
            return;
        }

        const pathParts = activeSectionPath.split(".");
        let rootConfig: SectionConfig | FieldConfig | undefined;

        // Détermine la configuration racine selon le type de section
        if (pathParts[0] === "page" && pathParts[1] === "blocks") {
            // Bloc de page
            const blockIndex = parseInt(pathParts[2], 10);
            const blockType = get(
                currentPageData,
                `page.blocks[${blockIndex}].type`,
            ) as string;
            rootConfig = schema.blocks?.[blockType];
        } else if (pathParts[0] === "page") {
            // Champ de page (ex: SEO)
            const fieldName = pathParts[1];
            rootConfig = schema.pageFields?.find(
                (f: FieldConfig) => f.name === fieldName,
            );
        } else if (pathParts[0] === "globals") {
            // Section globale (ex: header, footer)
            rootConfig = schema[pathParts[1]];
        }

        if (rootConfig && "label" in rootConfig) {
            setBreadcrumbs([
                {
                    path: activeSectionPath,
                    label: rootConfig.label,
                    config: rootConfig,
                },
            ]);
        }
    }, [activeSectionPath, currentPageData, schema]);

    /**
     * Navigue vers un niveau plus profond dans la hiérarchie
     *
     * @param fieldName - Nom du champ vers lequel naviguer
     * @param newConfig - Configuration du nouveau niveau
     * @param index - Index optionnel pour les tableaux
     */
    const drillDown = useCallback(
        (fieldName: string, newConfig: FieldConfig, index?: number) => {
            const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
            const currentPath = currentCrumb.path;
            const basePath = fieldName
                ? `${currentPath}.${fieldName}`
                : currentPath;
            const newPath =
                index !== undefined ? `${basePath}[${index}]` : basePath;

            const itemData = get(currentPageData, newPath) as Record<
                string,
                unknown
            >;
            const newLabel =
                (itemData?.label as string) ||
                (itemData?.title as string) ||
                newConfig.label ||
                `Élément #${index !== undefined ? index + 1 : ""}`;

            setBreadcrumbs((prev) => [
                ...prev,
                { path: newPath, label: newLabel, config: newConfig },
            ]);
        },
        [breadcrumbs, currentPageData],
    );

    /**
     * Revient à un niveau précédent dans la hiérarchie
     *
     * @param index - Index du niveau vers lequel revenir
     */
    const goBack = useCallback((index: number) => {
        setBreadcrumbs((prev) => prev.slice(0, index + 1));
    }, []);

    // Ne rien afficher si le panneau est fermé ou sans fil d'Ariane
    if (!isOpen || breadcrumbs.length === 0) return null;

    const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
    const currentPath = currentCrumb.path;
    const currentConfig = currentCrumb.config;
    const currentData = get(currentPageData, currentPath) as Record<
        string,
        unknown
    >;

    return (
        <div className="fixed top-0 left-0 h-screen w-[420px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header avec fil d'Ariane */}
            <header className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                <nav className="text-sm font-medium text-gray-500 truncate">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index}>
                            <button
                                onClick={() => goBack(index)}
                                disabled={index === breadcrumbs.length - 1}
                                className="disabled:text-gray-800 disabled:font-bold hover:underline"
                                type="button"
                            >
                                {crumb.label}
                            </button>
                            {index < breadcrumbs.length - 1 && (
                                <span className="mx-1">/</span>
                            )}
                        </span>
                    ))}
                </nav>
                <button
                    onClick={onClose}
                    className="text-gray-400 text-2xl hover:text-gray-800 p-1 rounded-full"
                    title="Fermer"
                    type="button"
                >
                    &times;
                </button>
            </header>

            {/* Contenu scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                <FieldRenderer
                    config={currentConfig}
                    data={currentData}
                    path={currentPath}
                    onUpdate={onUpdate}
                    onDrillDown={drillDown}
                />
            </div>
        </div>
    );
};

/**
 * FieldRenderer - Composant de rendu récursif des champs
 * Affiche les champs appropriés selon leur type et gère la visibilité conditionnelle
 */
const FieldRenderer = ({
    config,
    data,
    path,
    onUpdate,
    onDrillDown,
}: FieldRendererProps) => {
    // Gère les champs de type array (repeater)
    if ("type" in config && config.type === "array") {
        const arrayData = Array.isArray(data) ? data : [];
        return (
            <RepeaterField
                label={config.label}
                value={
                    arrayData as Array<{ id: string; [key: string]: unknown }>
                }
                config={config}
                onChange={(newValue) => onUpdate(path, newValue)}
                onItemClick={(index) => {
                    onDrillDown(
                        "",
                        {
                            label: config.label,
                            fields: Object.values(config.itemFields),
                        } as unknown as FieldConfig,
                        index,
                    );
                }}
            />
        );
    }

    // Pour les sections avec plusieurs champs
    const fields = "fields" in config ? config.fields : [];

    // Filtre les champs visibles selon les conditions
    const visibleFields = fields.filter((field: FieldConfig) => {
        if (!field.condition) return true;

        const controllerFieldValue = data?.[field.condition.field];
        return controllerFieldValue === field.condition.value;
    });

    if (!visibleFields.length) {
        return (
            <div className="text-sm text-gray-500 text-center py-8">
                Aucun champ à afficher
            </div>
        );
    }

    return (
        <>
            {visibleFields.map((field: FieldConfig) => (
                <FieldInput
                    key={field.name}
                    field={field}
                    value={data?.[field.name]}
                    onChange={(newValue) =>
                        onUpdate(`${path}.${field.name}`, newValue)
                    }
                    onDrillDown={onDrillDown}
                />
            ))}
        </>
    );
};

/**
 * Props du composant FieldInput
 */
interface FieldInputProps {
    field: FieldConfig;
    value: unknown;
    onChange: (value: unknown) => void;
    onDrillDown: (
        fieldName: string,
        newConfig: FieldConfig,
        index?: number,
    ) => void;
}

/**
 * FieldInput - Composant de rendu d'un champ individuel
 * Sélectionne le bon composant selon le type de champ
 */
const FieldInput = ({
    field,
    value,
    onChange,
    onDrillDown,
}: FieldInputProps) => {
    switch (field.type) {
        case "string":
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                    </label>
                    <input
                        type="text"
                        value={(value as string) || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            );

        case "text":
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                    </label>
                    <textarea
                        value={(value as string) || ""}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            );

        case "image":
            return (
                <ImageField
                    label={field.label}
                    value={(value as string) || ""}
                    onChange={onChange}
                />
            );

        case "link":
            return (
                <LinkField
                    label={field.label}
                    value={(value as string) || ""}
                    onChange={onChange}
                />
            );

        case "array":
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                    </label>
                    <button
                        onClick={() => onDrillDown(field.name, field)}
                        className="w-full bg-white border border-gray-300 rounded-md p-3 text-left hover:border-blue-500"
                        type="button"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                {Array.isArray(value) ? value.length : 0}{" "}
                                élément(s)
                            </span>
                            <span className="text-blue-600 text-xs font-semibold">
                                GÉRER &rarr;
                            </span>
                        </div>
                    </button>
                </div>
            );

        case "boolean":
            return (
                <ToggleField
                    label={field.label}
                    value={Boolean(value)}
                    config={field}
                    onChange={onChange}
                />
            );

        case "object":
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                    </label>
                    <button
                        onClick={() => onDrillDown(field.name, field)}
                        className="w-full bg-white border border-gray-300 rounded-md p-3 text-left hover:border-blue-500"
                        type="button"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                Gérer les champs
                            </span>
                            <span className="text-blue-600 text-xs font-semibold">
                                ÉDITER &rarr;
                            </span>
                        </div>
                    </button>
                </div>
            );

        case "richText":
            return (
                <RichTextField
                    label={field.label}
                    value={(value as string) || ""}
                    onChange={onChange}
                />
            );

        case "collection":
            return (
                <CollectionField
                    label={field.label}
                    value={(value as string) || ""}
                    onChange={onChange}
                />
            );

        default:
            return (
                <div className="text-sm text-red-500">
                    Type de champ non supporté: {(field as FieldConfig).type}
                </div>
            );
    }
};
