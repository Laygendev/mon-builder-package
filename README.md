# @laydevjim/mon-builder

Une librairie de composants d'édition pour Next.js qui permet de créer un éditeur de contenu visuel puissant et flexible.

## 🚀 Fonctionnalités

- ✨ **Éditeur visuel** : Éditez votre contenu directement dans le navigateur
- 🔄 **Drag & Drop** : Réorganisez vos blocs et éléments facilement
- 📦 **Composants modulaires** : Architecture basée sur des blocs réutilisables
- 🎨 **Personnalisable** : Définissez vos propres types de blocs et schémas
- 💾 **Gestion d'état** : Détection automatique des changements non sauvegardés
- 🔒 **Type-safe** : Écrit en TypeScript avec un typage complet
- ⚡ **Performant** : Optimisé avec React hooks et mémoïsation

## 📦 Installation

```bash
npm install @laydevjim/mon-builder
```

## 🛠️ Prérequis

- Next.js >= 13
- React >= 18
- React DOM >= 18

## 📚 Utilisation

### 1. Configuration de base

Créez un fichier de configuration pour définir vos schémas :

```typescript
// config/builder.config.ts
import { PageSchema, BuilderConfig } from '@laydevjim/mon-builder';

export const pageSchema: PageSchema = {
  blocks: {
    hero: {
      label: 'Hero Section',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Titre',
        },
        {
          type: 'text',
          name: 'description',
          label: 'Description',
        },
        {
          type: 'image',
          name: 'backgroundImage',
          label: 'Image de fond',
        },
      ],
      defaultData: {
        title: 'Bienvenue',
        description: '',
        backgroundImage: '',
      },
    },
  },
};

export const builderConfig: BuilderConfig = {
  globalSchemas: {
    header: {
      label: 'En-tête',
      fields: [
        {
          type: 'string',
          name: 'siteName',
          label: 'Nom du site',
        },
        {
          type: 'array',
          name: 'menuItems',
          label: 'Éléments de menu',
          itemFields: {
            label: { type: 'string', name: 'label', label: 'Label' },
            url: { type: 'link', name: 'url', label: 'URL' },
          },
        },
      ],
    },
    footer: {
      label: 'Pied de page',
      fields: [
        {
          type: 'string',
          name: 'copyright',
          label: 'Copyright',
        },
      ],
    },
  },
};
```

### 2. Configuration de la route admin

Créez une route admin dans votre application Next.js :

```typescript
// app/admin/[...path]/page.tsx
import { AdminProvider, AdminUI } from '@laydevjim/mon-builder';
import { builderConfig, pageSchema } from '@/config/builder.config';
import { BlockRenderer } from '@/components/BlockRenderer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AdminPage() {
  return (
    <AdminProvider config={builderConfig}>
      <AdminUI
        BlockRenderer={BlockRenderer}
        HeaderComponent={Header}
        FooterComponent={Footer}
      />
    </AdminProvider>
  );
}
```

### 3. Créer vos composants de rendu

```typescript
// components/BlockRenderer.tsx
import { BlockData } from '@laydevjim/mon-builder';

export function BlockRenderer({ block }: { block: BlockData }) {
  switch (block.type) {
    case 'hero':
      return (
        <section className="hero">
          <h1>{block.data.title}</h1>
          <p>{block.data.description}</p>
          {block.data.backgroundImage && (
            <img src={block.data.backgroundImage} alt="" />
          )}
        </section>
      );
    default:
      return null;
  }
}
```

### 4. Configuration des API Routes

Créez les routes API nécessaires :

```typescript
// app/api/get-page-data/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');
  
  // Chargez vos données depuis votre source (fichier, base de données, etc.)
  const data = await loadPageData(pathname);
  
  return NextResponse.json({
    initialData: data,
    schema: pageSchema,
  });
}
```

```typescript
// app/api/save-content/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { pathname, content } = await request.json();
  
  // Sauvegardez vos données
  await savePageData(pathname, content);
  
  return NextResponse.json({
    success: true,
    message: 'Contenu sauvegardé avec succès',
  });
}
```

```typescript
// app/api/upload-image/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Gérez l'upload de l'image
  const filePath = await uploadImage(file);
  
  return NextResponse.json({ filePath });
}
```

## 🎨 Types de champs disponibles

### Champs de texte

- **`string`** : Champ texte simple
- **`text`** : Zone de texte multiligne
- **`richText`** : Éditeur de texte riche (WYSIWYG)

### Champs média

- **`image`** : Sélecteur d'image avec upload
- **`link`** : Sélecteur de lien

### Champs structurés

- **`array`** : Liste d'éléments avec drag & drop
- **`object`** : Groupe de champs imbriqués
- **`boolean`** : Toggle on/off
- **`collection`** : Référence à une collection

## 🔧 Configuration avancée

### Champs conditionnels

Vous pouvez afficher des champs de manière conditionnelle :

```typescript
{
  type: 'boolean',
  name: 'hasButton',
  label: 'Afficher un bouton',
},
{
  type: 'string',
  name: 'buttonText',
  label: 'Texte du bouton',
  condition: {
    field: 'hasButton',
    value: true,
  },
}
```

### Données par défaut

Définissez des valeurs par défaut pour vos blocs :

```typescript
{
  label: 'Hero Section',
  fields: [...],
  defaultData: {
    title: 'Titre par défaut',
    showButton: true,
  },
}
```

## 📖 API Reference

### Composants principaux

#### `<AdminProvider>`

Provider racine qui charge les données de la page.

**Props:**
- `config: BuilderConfig` - Configuration de l'éditeur
- `children: ReactNode` - Composants enfants

#### `<AdminUI>`

Interface principale de l'éditeur.

**Props:**
- `BlockRenderer: ComponentType<{ block: BlockData }>` - Composant de rendu des blocs
- `HeaderComponent: ComponentType<{ headerData: Record<string, unknown> }>` - Composant header
- `FooterComponent: ComponentType<{ footerData: Record<string, unknown> }>` - Composant footer
- `UserToolbarComponent?: ComponentType` - Barre d'outils personnalisée (optionnel)

### Hooks

#### `useAdmin()`

Accède au contexte d'administration.

```typescript
const { initialData, schema, pathname, config } = useAdmin();
```

#### `useEditing()`

Accède au contexte d'édition.

```typescript
const { activeSectionPath, setActiveSection, clearActiveSection } = useEditing();
```

#### `useNotification()`

Affiche des notifications.

```typescript
const { showNotification } = useNotification();
showNotification('Sauvegarde réussie', 'success');
```

#### `useConfirm()`

Affiche des dialogues de confirmation.

```typescript
const confirm = useConfirm();
const result = await confirm({
  title: 'Confirmer',
  message: 'Êtes-vous sûr ?',
});
```

## 🎯 Structure des données

### SiteData

```typescript
interface SiteData {
  page: {
    blocks: BlockData[];
    [key: string]: unknown;
  };
  globals: {
    header?: Record<string, unknown>;
    footer?: Record<string, unknown>;
    [key: string]: unknown;
  };
}
```

### BlockData

```typescript
interface BlockData {
  id: string;
  type: string;
  data: Record<string, unknown>;
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 👨‍💻 Auteur

@laydevjim

## 🔗 Liens utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation React](https://react.dev)
- [DnD Kit](https://dndkit.com) - Bibliothèque de drag & drop utilisée