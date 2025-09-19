// src/components/EditingPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { get } from "lodash";
import { PageSchema, FieldConfig, SectionConfig } from "./../lib/pageSchema";
import { RepeaterField } from "./fields/RepeaterField";
import { LinkField } from "./fields/LinkField";
import { ImageField } from "./fields/ImageField";
import { ToggleField } from "./fields/ToggleField";
import { RichTextField } from "./fields/RichTextField";
import { CollectionField } from "./fields/CollectionField";

interface Breadcrumb {
  path: string;
  label: string;
  config: any; // On stocke la configuration directement dans le fil d'Ariane
}

interface EditingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeSectionPath: string | null;
  currentPageData: any;
  onUpdate: (path: string, value: any) => void;
  schema: PageSchema & { [key: string]: SectionConfig };
}

export const EditingPanel = ({
  isOpen,
  onClose,
  activeSectionPath,
  currentPageData,
  onUpdate,
  schema,
}: EditingPanelProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    if (activeSectionPath) {
      let rootConfig;
      const pathParts = activeSectionPath.split(".");
      if (pathParts[0] === "page" && pathParts[1] === "blocks") {
        const blockType = get(
          currentPageData,
          `page.blocks[${pathParts[2]}].type`
        );
        rootConfig = schema.blocks?.[blockType];
      } else if (pathParts[0] === "page") {
        rootConfig = schema.pageFields?.find(
          (f: any) => f.name === pathParts[1]
        );
      } else if (pathParts[0] === "globals") {
        rootConfig = schema[pathParts[1]];
      }
      if (rootConfig) {
        setBreadcrumbs([
          {
            path: activeSectionPath,
            label: rootConfig.label,
            config: rootConfig,
          },
        ]);
      }
    } else {
      setBreadcrumbs([]);
    }
  }, [activeSectionPath]);

  if (!isOpen || breadcrumbs.length === 0) return null;

  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
  const currentPath = currentCrumb.path;
  const currentConfig = currentCrumb.config;
  const currentData = get(currentPageData, currentPath);

  const drillDown = (fieldName: string, newConfig: any, index?: number) => {
    const basePath = fieldName ? `${currentPath}.${fieldName}` : currentPath;
    const newPath = index !== undefined ? `${basePath}[${index}]` : basePath;
    const itemData = index !== undefined ? get(currentPageData, newPath) : {};
    const newLabel =
      itemData?.label ||
      itemData?.title ||
      newConfig.label ||
      `Élément #${index !== undefined ? index + 1 : ""}`;

    setBreadcrumbs((prev) => [
      ...prev,
      { path: newPath, label: newLabel, config: newConfig },
    ]);
  };

  const goBack = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleUpdate = (path: string, value: any) => {
    onUpdate(path, value);
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[420px] bg-white shadow-2xl z-50 flex flex-col">
      <header className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <nav className="text-sm font-medium text-gray-500 truncate">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              <button
                onClick={() => goBack(index)}
                disabled={index === breadcrumbs.length - 1}
                className="disabled:text-gray-800 disabled:font-bold hover:underline"
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
        >
          &times;
        </button>
      </header>

      <div className="p-6 space-y-6 overflow-y-auto flex-grow">
        <FieldRenderer
          config={currentConfig}
          data={currentData}
          path={currentPath}
          onUpdate={handleUpdate}
          onDrillDown={drillDown}
        />
      </div>
    </div>
  );
};

// --- Composant de Rendu de Champ ---
const FieldRenderer = ({ config, data, path, onUpdate, onDrillDown }: any) => {
  if (!config)
    return (
      <div className="text-sm text-red-500">
        Erreur: Configuration de champ introuvable.
      </div>
    );

  if (config.type === "array") {
    return (
      <RepeaterField
        label={config.label}
        value={data || []}
        config={config}
        onChange={(newValue) => onUpdate(path, newValue)}
        onItemClick={(index, item) => {
          // On passe la config des enfants au niveau suivant
          onDrillDown("", { fields: Object.values(config.itemFields) }, index);
        }}
      />
    );
  }

  const visibleFields = (config.fields || []).filter((field: FieldConfig) => {
    if (!field.condition) {
      return true; // Toujours afficher s'il n'y a pas de condition
    }
    const controllerFieldValue = data?.[field.condition.field];
    return controllerFieldValue === field.condition.value;
  });

  return visibleFields.map((field: FieldConfig) => {
    const fieldName = field.name;
    const value = data?.[fieldName];
    const onChange = (newValue: any) => {
      const newParentData = { ...data, [fieldName]: newValue };
      onUpdate(path, newParentData);
    };

    switch (field.type) {
      case "string":
      case "text":
        const Input = field.type === "text" ? "textarea" : "input";
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        );
      case "image":
        return (
          <ImageField
            key={fieldName}
            label={field.label}
            value={value}
            onChange={onChange}
          />
        );
      case "link":
        return (
          <LinkField
            key={fieldName}
            label={field.label}
            value={value}
            onChange={onChange}
          />
        );
      case "array":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="mt-1">
              <button
                onClick={() => onDrillDown(fieldName, field)}
                className="w-full bg-white border border-gray-300 rounded-md p-3 text-left hover:border-blue-500"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {(value || []).length} élément(s)
                  </span>
                  <span className="text-blue-600 text-xs font-semibold">
                    GÉRER &rarr;
                  </span>
                </div>
              </button>
            </div>
          </div>
        );
      case "boolean": // <-- NOUVEAU CAS POUR LE TOGGLE
        return (
          <ToggleField
            key={fieldName}
            label={field.label}
            value={!!value}
            config={field}
            onChange={onChange}
          />
        );

      case "object": // <-- NOUVEAU CAS POUR L'OBJET
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="mt-1">
              <button
                // On "rentre" dans le champ en passant sa propre config
                onClick={() => onDrillDown(fieldName, field)}
                className="w-full bg-white border border-gray-300 rounded-md p-3 text-left hover:border-blue-500"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gérer les champs</span>
                  <span className="text-blue-600 text-xs font-semibold">
                    ÉDITER &rarr;
                  </span>
                </div>
              </button>
            </div>
          </div>
        );

      case "richText": // <-- NOUVEAU CAS
        return (
          <RichTextField
            key={fieldName}
            label={field.label}
            value={value || ""}
            onChange={onChange}
          />
        );

      case "collection": // <-- NOUVEAU CAS
        return (
          <CollectionField
            key={fieldName}
            label={field.label}
            value={value || ""}
            onChange={onChange}
          />
        );

      default:
        return null;
    }
  });
};

// --- Adaptation nécessaire pour le PageBuilder ---
// La prop `onUpdate` passée au EditingPanel doit être une fonction
// qui prend le chemin complet et la nouvelle valeur
// et met à jour l'état `siteData` via `lodash.set`
