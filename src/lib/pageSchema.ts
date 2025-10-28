// src/lib/pageSchema.ts

/**
 * Configuration de base pour tous les champs
 */
interface BaseFieldConfig {
    label: string;
    name: string;
    condition?: {
        field: string;
        value: unknown;
    };
}

/**
 * Champ de type chaîne de caractères (input ou textarea)
 */
export interface StringFieldConfig extends BaseFieldConfig {
    type: "string" | "text";
}

/**
 * Champ de type tableau avec des éléments structurés
 */
export interface ArrayFieldConfig extends BaseFieldConfig {
    type: "array";
    itemFields: {
        [key: string]: FieldConfig;
    };
    defaultData?: Record<string, unknown>;
}

/**
 * Champ de type lien (URL + texte)
 */
export interface LinkFieldConfig extends BaseFieldConfig {
    type: "link";
}

/**
 * Champ de type image (URL + alt)
 */
export interface ImageFieldConfig extends BaseFieldConfig {
    type: "image";
}

/**
 * Champ de type booléen (toggle)
 */
export interface BooleanFieldConfig extends BaseFieldConfig {
    type: "boolean";
    trueLabel?: string;
    falseLabel?: string;
}

/**
 * Champ de type objet avec sous-champs
 */
export interface ObjectFieldConfig extends BaseFieldConfig {
    type: "object";
    fields: FieldConfig[];
}

/**
 * Champ de type texte riche (éditeur WYSIWYG)
 */
export interface RichTextFieldConfig extends BaseFieldConfig {
    type: "richText";
}

/**
 * Champ de type collection (référence à une collection)
 */
export interface CollectionFieldConfig extends BaseFieldConfig {
    type: "collection";
}

/**
 * Union de tous les types de champs possibles
 */
export type FieldConfig =
    | StringFieldConfig
    | ArrayFieldConfig
    | RichTextFieldConfig
    | ObjectFieldConfig
    | LinkFieldConfig
    | ImageFieldConfig
    | BooleanFieldConfig
    | CollectionFieldConfig;

/**
 * Configuration d'une section (bloc ou section globale)
 */
export interface SectionConfig {
    label: string;
    fields: FieldConfig[];
    defaultData?: Record<string, unknown>;
}

/**
 * Structure de données d'une image
 */
export interface ImageData {
    url: string;
    alt: string;
}

/**
 * Structure de données d'un lien
 */
export interface LinkData {
    url: string;
    text: string;
    openInNewTab?: boolean;
}

/**
 * Structure de données d'un bloc de page
 */
export interface BlockData {
    id: string;
    type: string;
    data: Record<string, unknown>;
}

/**
 * Structure de données d'une page
 */
export interface PageData {
    blocks: BlockData[];
    [key: string]: unknown;
}

/**
 * Structure de données globales du site
 */
export interface GlobalsData {
    header?: Record<string, unknown>;
    footer?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * Structure complète des données du site
 */
export interface SiteData {
    page: PageData;
    globals: GlobalsData;
}

/**
 * Schéma de page définissant la structure éditable
 */
export interface PageSchema {
    pageFields?: FieldConfig[];
    globalSections?: {
        [key: string]: SectionConfig;
    };
    blocks: {
        [key: string]: SectionConfig;
    };
}

/**
 * Configuration complète de l'éditeur
 */
export interface BuilderConfig {
    globalSchemas: {
        [key: string]: SectionConfig;
    };
    contentTypes?: {
        [key: string]: {
            label: string;
            [key: string]: unknown;
        };
    };
    apiEndpoint?: string;
    [key: string]: unknown;
}
