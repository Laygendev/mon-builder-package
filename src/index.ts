// src/index.ts

/**
 * @laydevjim/mon-builder
 * Une librairie de composants d'édition pour Next.js
 *
 * @version 1.0.7
 * @license MIT
 */

// ===================================================================
// CONTEXTES
// ===================================================================

export { AdminContextProvider, useAdmin } from "./context/AdminContext";
export { EditingProvider, useEditing } from "./context/EditingContext";
export {
    NotificationProvider,
    useNotification,
} from "./context/NotificationContext";
export {
    ConfirmationProvider,
    useConfirm,
} from "./context/ConfirmationContext";

// ===================================================================
// COMPOSANTS PRINCIPAUX
// ===================================================================

export { AdminProvider } from "./components/AdminProvider";
export { AdminUI } from "./components/AdminUI";
export { PageBuilder } from "./components/PageBuilder";
export { AdminToolbar } from "./components/AdminToolbar";

// ===================================================================
// COMPOSANTS DE STRUCTURE
// ===================================================================

export { CollectionView } from "./components/CollectionView";
export { ContentWrapper } from "./components/ContentWrapper";
export { EditableSection } from "./components/EditableSection";
export { EditingPanel } from "./components/EditingPanel";
export { StructurePanel } from "./components/StructurePanel";
export { EditorToolbar } from "./components/EditorToolbar";

// ===================================================================
// COMPOSANTS UI
// ===================================================================

export { ConfirmationDialog } from "./components/ConfirmationDialog";
export { Notification } from "./components/Notification";
export { UnsavedChangesWarning } from "./components/UnsavedChangesWarning";
export { ManagementPanel } from "./components/ManagementPanel";

// ===================================================================
// COMPOSANTS DE CHAMPS
// ===================================================================

export { RepeaterField } from "./components/fields/RepeaterField";
export { LinkField } from "./components/fields/LinkField";
export { ImageField } from "./components/fields/ImageField";
export { ToggleField } from "./components/fields/ToggleField";
export { RichTextField } from "./components/fields/RichTextField";
export { CollectionField } from "./components/fields/CollectionField";

// ===================================================================
// TYPES ET INTERFACES
// ===================================================================

export type {
    // Schémas
    PageSchema,
    SectionConfig,
    FieldConfig,

    // Types de champs spécifiques
    StringFieldConfig,
    ArrayFieldConfig,
    LinkFieldConfig,
    ImageFieldConfig,
    BooleanFieldConfig,
    ObjectFieldConfig,
    RichTextFieldConfig,
    CollectionFieldConfig,

    // Structures de données
    SiteData,
    PageData,
    GlobalsData,
    BlockData,
    ImageData,
    LinkData,

    // Configuration
    BuilderConfig,
} from "./lib/pageSchema";

// ===================================================================
// UTILITAIRES
// ===================================================================

/**
 * Version de la librairie
 */
export const VERSION = "1.0.7";

/**
 * Informations sur la librairie
 */
export const LIBRARY_INFO = {
    name: "@laydevjim/mon-builder",
    version: VERSION,
    description: "Une librairie de composants d'édition pour Next.js",
    author: "@laydevjim",
    license: "MIT",
} as const;
