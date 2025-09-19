// packages/builder/src/components/ContentWrapper.tsx
"use client";

import { EditableSection } from './EditableSection';

export const ContentWrapper = ({ siteData, handleSelectBlock, BlockRenderer }: any) => {
  const pageBlocks = siteData.page?.blocks || [];

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      {pageBlocks.map((block: any, index: number) => (
        <EditableSection
          key={block.id}
          path={`page.blocks.${index}.data`}
          onSelect={() => handleSelectBlock(index)}
        >
          <BlockRenderer block={block} />
        </EditableSection>
      ))}
      {pageBlocks.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          Cette page est vide. Utilisez le panneau de structure.
        </div>
      )}
    </main>
  );
};