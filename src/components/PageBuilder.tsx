// src/components/PageBuilder.tsx
"use client";

import { useEffect, useState } from "react";
import { cloneDeep, isEqual, set } from "lodash";
import { arrayMove } from "@dnd-kit/sortable"; // Importez l'utilitaire de dnd-kit
import { PageSchema } from "../lib/pageSchema";
import { EditingProvider, useEditing } from "../context/EditingContext";
import { EditingPanel } from "./EditingPanel";
import { EditableSection } from "./EditableSection";
import { StructurePanel } from "./StructurePanel"; // Importez le nouveau panneau
import { EditorToolbar } from "./EditorToolbar"; // Importez la barre d'outils
import { ComponentType } from "react";
import { ContentWrapper } from "./ContentWrapper";
import { useNotification } from "../context/NotificationContext";
import { useConfirm } from "../context/ConfirmationContext"; // <-- Importer le hook
import { UnsavedChangesWarning } from "./UnsavedChangesWarning"; // <-- NOUVEL IMPORT

// ===================================================================
// 2. Le Composant Parent (Logique) qui fournit le contexte
// ===================================================================
interface PageBuilderProps {
  initialData: any;
  schema: PageSchema;
  pathname: string;
  config: any;
  BlockRenderer: ComponentType<{ block: any }>; // <-- NOUVELLE PROP
  HeaderComponent: ComponentType<{ headerData: any }>;
  FooterComponent: ComponentType<{ footerData: any }>;
}

export function PageBuilder({
  initialData,
  schema,
  pathname,
  config,
  BlockRenderer,
  HeaderComponent,
  FooterComponent,
}: PageBuilderProps) {
  const [siteData, setSiteData] = useState(initialData); // Renommé pour plus de clarté
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { showNotification } = useNotification(); // <-- Utiliser le hook !
  const showConfirmationDialog = useConfirm(); // <-- Utiliser le hook !
  // Nouveaux états pour contrôler les panneaux
  const [activePanel, setActivePanel] = useState<
    "editing" | "structure" | null
  >(null);
  const [activeSectionPath, setActiveSectionPath] = useState<string | null>(
    null
  );

  useEffect(() => {
    // On compare l'état actuel avec l'état initial.
    const hasChanged = !isEqual(initialData, siteData);
    setIsDirty(hasChanged);
  }, [siteData, initialData]); // Les dépendances de l'effet

  // --- Fonctions de manipulation des Blocs (corrigées) ---
  const handleAddBlock = (blockType: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      data: cloneDeep(schema.blocks[blockType].defaultData || {}),
    };
    setSiteData((prev: any) => ({
      ...prev,
      page: {
        ...prev.page,
        blocks: [...prev.page.blocks, newBlock],
      },
    }));
  };

  const handleDeleteBlock = async (index: number) => {
    const isConfirmed = await showConfirmationDialog({
      title: "Confirmer la suppression",
      message:
        "Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.",
      confirmText: "Supprimer",
    });

    if (!isConfirmed) return;

    setSiteData((prev: any) => ({
      ...prev,
      page: {
        ...prev.page,
        blocks: prev.page.blocks.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const handleReorderBlocks = (oldIndex: number, newIndex: number) => {
    setSiteData((prev: any) => ({
      ...prev,
      page: {
        ...prev.page,
        blocks: arrayMove(prev.page.blocks, oldIndex, newIndex),
      },
    }));
  };

  const handleSelectBlock = (index: number) => {
    // Le chemin doit maintenant inclure 'page'
    const path = `page.blocks.${index}.data`;
    setActiveSectionPath(path);
    setActivePanel("editing");
  };

  const handleSelectSection = (keyOrPath: string) => {
    let path: string;

    // 2. On la rend intelligente : si le chemin contient déjà un '.', on le prend tel quel.
    if (keyOrPath.includes('.')) {
      path = keyOrPath;
    } else {
      // Sinon, c'est une ancienne clé globale (comme "header"), on ajoute "globals."
      path = `globals.${keyOrPath}`;
    }
    
    setActiveSectionPath(path);
    setActivePanel("editing");
  };

  const handleDeepUpdate = (fullPath: string, value: any) => {
    const newSiteData = cloneDeep(siteData);
    set(newSiteData, fullPath, value); // lodash.set est parfait pour ça
    setSiteData(newSiteData);
  };

  const saveContentToServer = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname, content: siteData }),
      });
      if (!response.ok) throw new Error("La sauvegarde a échoué.");
      const result = await response.json();
      showNotification(result.message, "success");
      setIsDirty(false);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      showNotification(
        "Une erreur est survenue lors de la sauvegarde.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const pageBlocks = siteData.page?.blocks || [];

  // Le parent ne fait que rendre le Provider et l'enfant
  return (
    <EditingProvider
      schema={{ ...schema, ...config.globalSchemas }}
      config={config}
    >
      <UnsavedChangesWarning isDirty={isDirty} />

      <EditorToolbar
        onToggleStructure={() =>
          setActivePanel(activePanel === "structure" ? null : "structure")
        }
        onSave={saveContentToServer}
        isSaving={isSaving}
        isDirty={isDirty} // <-- Passez le nouvel état à la barre d'outils
      />
      {/* Le panneau d'édition ne s'ouvre que si 'editing' est le panneau actif */}
      <EditingPanel
        isOpen={activePanel === "editing"}
        onClose={() => {
          setActivePanel(null);
          setActiveSectionPath(null);
        }}
        activeSectionPath={activeSectionPath} // Passe le chemin actif
        currentPageData={siteData}
        onUpdate={(path, value) => {
          // Adaptez l'appel
          const fullPath = path;
          handleDeepUpdate(fullPath, value);
        }}
        schema={{ ...schema, ...config.globalSchemas }}
      />
      {/* Le nouveau panneau de structure */}
      <StructurePanel
        isOpen={activePanel === "structure"}
        onClose={() => setActivePanel(null)}
        blocks={siteData.page.blocks || []}
        onReorder={handleReorderBlocks}
        onDelete={handleDeleteBlock}
        onAdd={handleAddBlock}
        onSelectBlock={handleSelectBlock}
        onSelectGlobal={handleSelectSection}
      />

      <>
        {siteData.globals?.header && (
          <EditableSection
            path="globals.header"
            onSelect={() => handleSelectSection("header")}
          >
            <HeaderComponent headerData={siteData.globals.header} />
          </EditableSection>
        )}
        <ContentWrapper
          siteData={siteData}
          BlockRenderer={BlockRenderer}
          handleSelectBlock={handleSelectBlock}
        />
        {siteData.globals?.footer && (
          <EditableSection
            path="globals.footer"
            onSelect={() => handleSelectSection("footer")}
          >
            <FooterComponent footerData={siteData.globals.footer} />
          </EditableSection>
        )}
      </>
    </EditingProvider>
  );
}
