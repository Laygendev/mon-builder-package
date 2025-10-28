// src/components/fields/index.ts

/**
 * Index des composants de champs
 * Exporte tous les composants de champs utilisables dans l'éditeur
 */

export { RepeaterField } from "./RepeaterField";
export { LinkField } from "./LinkField";
export { ImageField } from "./ImageField";
export { ToggleField } from "./ToggleField";
export { RichTextField } from "./RichTextField";
export { CollectionField } from "./CollectionField";

// Types pour les champs
export type {
    ArrayFieldConfig,
    LinkFieldConfig,
    ImageFieldConfig,
    BooleanFieldConfig,
    RichTextFieldConfig,
    CollectionFieldConfig,
    StringFieldConfig,
    ObjectFieldConfig,
    FieldConfig,
} from "../../lib/pageSchema";
