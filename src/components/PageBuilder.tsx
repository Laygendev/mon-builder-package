// src/components/PageBuilder.tsx
"use client";

import {
    useEffect,
    useState,
    useCallback,
    useMemo,
    ComponentType,
} from "react";
import { cloneDeep, isEqual, set } from "lodash";
import { arrayMove } from "@dnd-kit/sortable";
import {
    PageSchema,
    SiteData,
    BuilderConfig,
    BlockData,
    SectionConfig,
} from "../lib/pageSchema";
import { EditingProvider } from "../context/EditingContext";
import { EditingPanel } from "./EditingPanel";
import { EditableSection } from "./EditableSection";
import { StructurePanel } from "./StructurePanel";
import { EditorToolbar } from "./EditorToolbar";
import { ContentWrapper } from "./ContentWrapper";
import { useNotification } from "../context/NotificationContext";
import { useConfirm } from "../context/ConfirmationContext";
import { UnsavedChangesWarning } from "./UnsavedChangesWarning";

/**
 * Type de panneau actif dans l'interface
 */
type ActivePanel = "editing" | "structure" | null;

/**
 * Props pour le composant de rendu de bloc
 */
interface BlockRendererProps {
    block: BlockData;
}

/**
 * Props pour le composant de header
 */
interface HeaderComponentProps {
    headerData: Record<string, unknown>;
}

/**
 * Props pour le composant de footer
 */
interface FooterComponentProps {
    footerData: Record<string, unknown>;
}

/**
 * Props du composant PageBuilder
 */
interface PageBuilderProps {
    initialData: SiteData;
    schema: PageSchema;
    pathname: string;
    config: BuilderConfig;
    BlockRenderer: ComponentType<BlockRendererProps>;
    HeaderComponent: ComponentType<HeaderComponentProps>;
    FooterComponent: ComponentType<FooterComponentProps>;
}

/**
 * Réponse de l'API de sauvegarde
 */
interface SaveResponse {
    message: string;
    success: boolean;
}

/**
 * PageBuilder - Composant principal de l'éditeur de page
 * Gère l'état global de la page, les opérations CRUD sur les blocs,
 * et orchestre l'affichage des panneaux d'édition
 *
 * @param initialData - Données initiales de la page
 * @param schema - Schéma définissant la structure de la page
 * @param pathname - Chemin de la page actuelle
 * @param config - Configuration de l'éditeur
 * @param BlockRenderer - Composant pour rendre les blocs
 * @param HeaderComponent - Composant pour rendre le header
 * @param FooterComponent - Composant pour rendre le footer
 */
export function PageBuilder({
    initialData,
    schema,
    pathname,
    config,
    BlockRenderer,
    HeaderComponent,
    FooterComponent,
}: PageBuilderProps) {
    // État des données du site
    const [siteData, setSiteData] = useState<SiteData>(initialData);

    // État de sauvegarde
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // État des panneaux UI
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [activeSectionPath, setActiveSectionPath] = useState<string | null>(
        null,
    );

    // Hooks de contexte
    const { showNotification } = useNotification();
    const showConfirmationDialog = useConfirm();

    /**
     * Détecte les changements non sauvegardés
     */
    useEffect(() => {
        const hasChanged = !isEqual(initialData, siteData);
        setIsDirty(hasChanged);
    }, [siteData, initialData]);

    /**
     * Ajoute un nouveau bloc à la page
     * @param blockType - Type du bloc à ajouter
     */
    const handleAddBlock = useCallback(
        (blockType: string) => {
            const blockConfig = schema.blocks[blockType];
            if (!blockConfig) {
                showNotification(`Type de bloc inconnu: ${blockType}`, "error");
                return;
            }

            const newBlock: BlockData = {
                id: `block-${Date.now()}`,
                type: blockType,
                data: cloneDeep(blockConfig.defaultData || {}),
            };

            setSiteData((prev) => ({
                ...prev,
                page: {
                    ...prev.page,
                    blocks: [...prev.page.blocks, newBlock],
                },
            }));
        },
        [schema.blocks, showNotification],
    );

    /**
     * Supprime un bloc de la page après confirmation
     * @param index - Index du bloc à supprimer
     */
    const handleDeleteBlock = useCallback(
        async (index: number) => {
            const isConfirmed = await showConfirmationDialog({
                title: "Confirmer la suppression",
                message:
                    "Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.",
                confirmText: "Supprimer",
                cancelText: "Annuler",
            });

            if (!isConfirmed) return;

            setSiteData((prev) => ({
                ...prev,
                page: {
                    ...prev.page,
                    blocks: prev.page.blocks.filter((_, i) => i !== index),
                },
            }));
        },
        [showConfirmationDialog],
    );

    /**
     * Réordonne les blocs de la page
     * @param oldIndex - Index actuel du bloc
     * @param newIndex - Nouvel index du bloc
     */
    const handleReorderBlocks = useCallback(
        (oldIndex: number, newIndex: number) => {
            setSiteData((prev) => ({
                ...prev,
                page: {
                    ...prev.page,
                    blocks: arrayMove(prev.page.blocks, oldIndex, newIndex),
                },
            }));
        },
        [],
    );

    /**
     * Sélectionne un bloc pour l'édition
     * @param index - Index du bloc à sélectionner
     */
    const handleSelectBlock = useCallback((index: number) => {
        const path = `page.blocks.${index}.data`;
        setActiveSectionPath(path);
        setActivePanel("editing");
    }, []);

    /**
     * Sélectionne une section globale ou un champ de page pour l'édition
     * @param keyOrPath - Clé ou chemin de la section
     */
    const handleSelectSection = useCallback((keyOrPath: string) => {
        // Si le chemin contient un point, on le prend tel quel
        // Sinon, on considère que c'est une section globale
        const path = keyOrPath.includes(".")
            ? keyOrPath
            : `globals.${keyOrPath}`;
        setActiveSectionPath(path);
        setActivePanel("editing");
    }, []);

    /**
     * Met à jour une valeur profonde dans les données du site
     * @param fullPath - Chemin complet vers la valeur (ex: "page.blocks.0.data.title")
     * @param value - Nouvelle valeur
     */
    const handleDeepUpdate = useCallback((fullPath: string, value: unknown) => {
        setSiteData((prev) => {
            const newData = cloneDeep(prev);
            set(newData, fullPath, value);
            return newData;
        });
    }, []);

    /**
     * Sauvegarde le contenu sur le serveur
     */
    const saveContentToServer = useCallback(async () => {
        setIsSaving(true);

        try {
            const response = await fetch("/api/save-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pathname, content: siteData }),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result: SaveResponse = await response.json();
            showNotification(
                result.message || "Sauvegarde réussie !",
                "success",
            );
            setIsDirty(false);

            // Recharge la page après un court délai pour récupérer les données à jour
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la sauvegarde.";
            showNotification(errorMessage, "error");
        } finally {
            setIsSaving(false);
        }
    }, [pathname, siteData, showNotification]);

    /**
     * Bascule l'affichage du panneau de structure
     */
    const handleToggleStructure = useCallback(() => {
        setActivePanel((prev) => (prev === "structure" ? null : "structure"));
    }, []);

    /**
     * Ferme le panneau d'édition
     */
    const handleCloseEditingPanel = useCallback(() => {
        setActivePanel(null);
        setActiveSectionPath(null);
    }, []);

    /**
     * Ferme le panneau de structure
     */
    const handleCloseStructurePanel = useCallback(() => {
        setActivePanel(null);
    }, []);

    /**
     * Schéma complet incluant les schémas globaux
     */
    const fullSchema = useMemo(
        () =>
            ({ ...schema, ...config.globalSchemas }) as PageSchema & {
                [key: string]: SectionConfig;
            },
        [schema, config.globalSchemas],
    );

    return (
        <EditingProvider schema={fullSchema} config={config}>
            {/* Avertissement de changements non sauvegardés */}
            <UnsavedChangesWarning isDirty={isDirty} />

            {/* Barre d'outils de l'éditeur */}
            <EditorToolbar
                onToggleStructure={handleToggleStructure}
                onSave={saveContentToServer}
                isSaving={isSaving}
                isDirty={isDirty}
            />

            {/* Panneau d'édition des champs */}
            <EditingPanel
                isOpen={activePanel === "editing"}
                onClose={handleCloseEditingPanel}
                activeSectionPath={activeSectionPath}
                currentPageData={siteData}
                onUpdate={handleDeepUpdate}
                schema={fullSchema}
            />

            {/* Panneau de structure de la page */}
            <StructurePanel
                isOpen={activePanel === "structure"}
                onClose={handleCloseStructurePanel}
                blocks={siteData.page.blocks || []}
                onReorder={handleReorderBlocks}
                onDelete={handleDeleteBlock}
                onAdd={handleAddBlock}
                onSelectBlock={handleSelectBlock}
                onSelectGlobal={handleSelectSection}
            />

            {/* Contenu de la page */}
            <>
                {/* Header global */}
                {siteData.globals?.header && (
                    <EditableSection
                        path="globals.header"
                        onSelect={() => handleSelectSection("header")}
                    >
                        <HeaderComponent
                            headerData={
                                siteData.globals.header as Record<
                                    string,
                                    unknown
                                >
                            }
                        />
                    </EditableSection>
                )}

                {/* Blocs de contenu de la page */}
                <ContentWrapper
                    siteData={siteData}
                    BlockRenderer={BlockRenderer}
                    handleSelectBlock={handleSelectBlock}
                />

                {/* Footer global */}
                {siteData.globals?.footer && (
                    <EditableSection
                        path="globals.footer"
                        onSelect={() => handleSelectSection("footer")}
                    >
                        <FooterComponent
                            footerData={
                                siteData.globals.footer as Record<
                                    string,
                                    unknown
                                >
                            }
                        />
                    </EditableSection>
                )}
            </>
        </EditingProvider>
    );
}
