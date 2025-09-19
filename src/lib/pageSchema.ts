interface BaseFieldConfig {
  label: string;
  name: string;
  condition?: {
    field: string;
    value: any;
  };
}

export interface StringFieldConfig extends BaseFieldConfig {
  type: "string" | "text";
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  type: "array";
  itemFields: {
    [key: string]: FieldConfig; 
  };
}

export interface LinkFieldConfig extends BaseFieldConfig {
  type: "link";
}

export interface ImageFieldConfig extends BaseFieldConfig {
  type: "image";
}

export interface BooleanFieldConfig extends BaseFieldConfig {
  type: 'boolean';
  trueLabel?: string;
  falseLabel?: string;
}

export interface ObjectFieldConfig extends BaseFieldConfig {
  type: 'object';
  fields: FieldConfig[]; // Un champ objet contient une liste de sous-champs
}

export interface RichTextFieldConfig extends BaseFieldConfig {
  type: 'richText';
}

export interface CollectionFieldConfig extends BaseFieldConfig {
  type: 'collection';
}

export type FieldConfig =
  | StringFieldConfig
  | ArrayFieldConfig
  | RichTextFieldConfig
  | ObjectFieldConfig
  | LinkFieldConfig
  | ImageFieldConfig
  | BooleanFieldConfig
  | CollectionFieldConfig;

export interface SectionConfig {
  label: string;
  fields: FieldConfig[];
  defaultData?: Record<string, any>;
}

export interface PageSchema {
  pageFields?: FieldConfig[]; // <-- NOUVELLE PROPRIÉTÉ OPTIONNELLE
  globalSections?: {
    [key: string]: SectionConfig;
  };
  blocks: {
    [key: string]: SectionConfig;
  };
}