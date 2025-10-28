// src/components/ContentWrapper.tsx
"use client";

import { ComponentType } from "react";
import { EditableSection } from "./EditableSection";
import { SiteData, BlockData } from "../lib/pageSchema";

/**
 * Props pour le composant de rendu de bloc
 */
interface BlockRendererProps {
    block: BlockData;
}

/**
 * Props du composant ContentWrapper
 */
interface ContentWrapperProps {
    siteData: SiteData;
    BlockRenderer: ComponentType<BlockRendererProps>;
    handleSelectBlock: (index: number) => void;
}

/**
 * ContentWrapper - Composant qui encapsule le contenu principal de la page
 * Rend tous les blocs de la page avec la possibilité de les éditer
 *
 * @param siteData - Données complètes du site
 * @param BlockRenderer - Composant pour rendre chaque bloc
 * @param handleSelectBlock - Fonction appelée lors de la sélection d'un bloc
 */
export const ContentWrapper = ({
    siteData,
    BlockRenderer,
    handleSelectBlock,
}: ContentWrapperProps) => {
    const pageBlocks = siteData.page?.blocks || [];

    return (
        <main className="max-w-5xl mx-auto p-8 space-y-8">
            {pageBlocks.length > 0 ? (
                pageBlocks.map((block: BlockData, index: number) => (
                    <EditableSection
                        key={block.id}
                        path={`page.blocks.${index}.data`}
                        onSelect={() => handleSelectBlock(index)}
                    >
                        <BlockRenderer block={block} />
                    </EditableSection>
                ))
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <div className="mb-4 text-6xl">📝</div>
                    <p className="text-lg font-medium">Cette page est vide</p>
                    <p className="text-sm mt-2">
                        Utilisez le panneau de structure pour ajouter des blocs
                        de contenu
                    </p>
                </div>
            )}
        </main>
    );
};
