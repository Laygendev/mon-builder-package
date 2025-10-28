# Guide de Contribution

Merci de votre intérêt pour contribuer à `@laydevjim/mon-builder` ! Ce guide vous aidera à maintenir la qualité et la cohérence du code.

## 📋 Table des matières

- [Principes de base](#principes-de-base)
- [Standards de code](#standards-de-code)
- [Architecture](#architecture)
- [Typage TypeScript](#typage-typescript)
- [Performance](#performance)
- [Tests](#tests)
- [Documentation](#documentation)
- [Processus de contribution](#processus-de-contribution)

## 🎯 Principes de base

### Qualité avant quantité
- Code lisible et maintenable
- Typage fort et exhaustif
- Performance optimisée
- Documentation claire

### DRY (Don't Repeat Yourself)
- Éviter la duplication de code
- Créer des composants réutilisables
- Extraire la logique commune

### Single Responsibility
- Chaque composant a une seule responsabilité
- Fonctions courtes et focalisées
- Séparation des concerns

## 📝 Standards de code

### TypeScript

#### ✅ À FAIRE

```typescript
// Typage explicite pour les props
interface MyComponentProps {
    title: string;
    onSave: (data: FormData) => void;
    isLoading?: boolean;
}

// Typage des fonctions
const handleSave = useCallback((data: FormData): void => {
    // ...
}, []);

// Utilisation de types génériques appropriés
const items: Array<BlockData> = [];

// Type guards pour la vérification de types
function isBlockData(value: unknown): value is BlockData {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'type' in value
    );
}
```

#### ❌ À ÉVITER

```typescript
// PAS de type 'any'
const data: any = {}; // ❌

// PAS de props non typées
function MyComponent({ props }: any) {} // ❌

// PAS de fonctions sans typage de retour
function calculate(x, y) { // ❌
    return x + y;
}
```

### React & Hooks

#### ✅ Optimisation des performances

```typescript
// Mémoïser les callbacks
const handleClick = useCallback(() => {
    // logique
}, [dependencies]);

// Mémoïser les valeurs calculées
const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
}, [items]);

// Mémoïser les composants purs
export const MyComponent = memo(({ data }: Props) => {
    // ...
});

// Mémoïser les valeurs de contexte
const contextValue = useMemo(
    () => ({ state, actions }),
    [state, actions]
);
```

#### ✅ Gestion des effets

```typescript
// Toujours spécifier les dépendances
useEffect(() => {
    // effet
}, [dependency1, dependency2]);

// Nettoyer les effets
useEffect(() => {
    const subscription = subscribe();
    return () => subscription.unsubscribe();
}, []);
```

### Structure des composants

```typescript
// src/components/MyComponent.tsx

"use client"; // Si composant client Next.js

import { useCallback, useMemo } from "react";
import { OtherComponent } from "./OtherComponent";
import { useMyContext } from "../context/MyContext";
import type { MyData } from "../lib/types";

/**
 * Props du composant MyComponent
 */
interface MyComponentProps {
    /** Description de la prop */
    data: MyData;
    /** Fonction appelée lors de la sauvegarde */
    onSave: (data: MyData) => void;
    /** Indicateur de chargement optionnel */
    isLoading?: boolean;
}

/**
 * MyComponent - Description du composant
 * 
 * Explication détaillée de ce que fait le composant,
 * comment l'utiliser, et les cas d'usage principaux.
 * 
 * @param data - Les données à afficher
 * @param onSave - Callback de sauvegarde
 * @param isLoading - État de chargement
 */
export const MyComponent = ({
    data,
    onSave,
    isLoading = false,
}: MyComponentProps) => {
    // 1. Hooks de contexte
    const { state } = useMyContext();
    
    // 2. État local
    const [localState, setLocalState] = useState(initialValue);
    
    // 3. Calculs mémoïsés
    const computedValue = useMemo(() => {
        return expensiveCalculation(data);
    }, [data]);
    
    // 4. Callbacks mémoïsés
    const handleSave = useCallback(() => {
        onSave(data);
    }, [onSave, data]);
    
    // 5. Effets
    useEffect(() => {
        // effet
    }, [dependencies]);
    
    // 6. Rendu
    return (
        <div className="my-component">
            {/* JSX */}
        </div>
    );
};
```

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── components/          # Composants React
│   ├── fields/         # Composants de champs
│   │   ├── index.ts    # Exports
│   │   └── *.tsx       # Composants
│   └── *.tsx
├── context/            # Contextes React
│   └── *.tsx
├── lib/                # Utilitaires et types
│   └── *.ts
└── index.ts            # Export principal
```

### Hiérarchie des composants

```
AdminProvider (données)
└── AdminUI (layout)
    ├── NotificationProvider (notifications)
    │   └── ConfirmationProvider (confirmations)
    │       └── PageBuilder (logique édition)
    │           ├── EditingProvider (contexte édition)
    │           ├── EditorToolbar (UI)
    │           ├── EditingPanel (formulaires)
    │           ├── StructurePanel (structure)
    │           └── Content (rendu)
```

## 🔒 Typage TypeScript

### Règles strictes

1. **Pas de `any`** - Utiliser `unknown` si le type est vraiment inconnu
2. **Typage explicite** - Toujours typer les props, retours de fonction, etc.
3. **Type guards** - Vérifier les types à runtime quand nécessaire
4. **Génériques** - Utiliser les génériques pour la réutilisabilité

### Patterns de typage

#### Union types

```typescript
type Status = "idle" | "loading" | "success" | "error";

interface State {
    status: Status;
    data?: SomeData;
    error?: Error;
}
```

#### Type narrowing

```typescript
function processValue(value: string | number) {
    if (typeof value === "string") {
        // TypeScript sait que c'est un string ici
        return value.toUpperCase();
    }
    // TypeScript sait que c'est un number ici
    return value.toFixed(2);
}
```

#### Utility types

```typescript
// Partial - rend toutes les propriétés optionnelles
type PartialUser = Partial<User>;

// Pick - sélectionne certaines propriétés
type UserPreview = Pick<User, "id" | "name">;

// Omit - exclut certaines propriétés
type UserWithoutPassword = Omit<User, "password">;

// Record - crée un type objet
type UserMap = Record<string, User>;
```

## ⚡ Performance

### Checklist d'optimisation

- [ ] Callbacks mémoïsés avec `useCallback`
- [ ] Valeurs calculées mémoïsées avec `useMemo`
- [ ] Composants purs mémoïsés avec `memo`
- [ ] Contextes avec valeurs stables
- [ ] Pas de création de fonctions/objets inline dans le JSX
- [ ] Listes avec `key` stable et unique
- [ ] Chargement lazy des composants lourds

### Anti-patterns à éviter

```typescript
// ❌ Création de fonction inline
<button onClick={() => doSomething(id)}>Click</button>

// ✅ Callback mémoïsé
const handleClick = useCallback(() => {
    doSomething(id);
}, [id]);
<button onClick={handleClick}>Click</button>

// ❌ Objet créé à chaque render
<Component style={{ margin: 10 }} />

// ✅ Objet stable
const style = { margin: 10 };
<Component style={style} />
```

## 🧪 Tests

### Structure des tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
    it('should render correctly', () => {
        render(<MyComponent data={mockData} />);
        expect(screen.getByText('Expected text')).toBeInTheDocument();
    });
    
    it('should handle user interaction', () => {
        const handleSave = jest.fn();
        render(<MyComponent onSave={handleSave} />);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleSave).toHaveBeenCalled();
    });
});
```

## 📚 Documentation

### JSDoc

Tous les composants, fonctions et types exportés doivent avoir une documentation JSDoc :

```typescript
/**
 * MyComponent - Description concise
 * 
 * Description détaillée avec exemples si nécessaire.
 * 
 * @param props - Les props du composant
 * @returns Le composant React
 * 
 * @example
 * ```tsx
 * <MyComponent data={data} onSave={handleSave} />
 * ```
 */
export function MyComponent(props: MyComponentProps) {
    // ...
}
```

### README

Mettre à jour le README pour :
- Nouvelles fonctionnalités
- Nouveaux types de champs
- Changements d'API
- Exemples d'utilisation

## 🔄 Processus de contribution

### 1. Fork et Clone

```bash
git clone https://github.com/votre-username/mon-builder.git
cd mon-builder/mon-builder-package
npm install
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-bug
```

### 3. Développer

- Suivre les standards de code
- Ajouter des types appropriés
- Documenter le code
- Tester manuellement

### 4. Vérifier

```bash
# Compiler TypeScript
npm run build

# Vérifier les erreurs
# (pas de commande de lint configurée actuellement)
```

### 5. Commit

Utiliser des messages de commit clairs :

```
feat: ajouter le support des champs de type date
fix: corriger la gestion du drag and drop
docs: mettre à jour le README avec les nouveaux types
refactor: simplifier la logique de EditingPanel
perf: optimiser le rendu des listes
```

### 6. Pull Request

- Décrire clairement les changements
- Référencer les issues liées
- Ajouter des captures d'écran si pertinent
- Expliquer les décisions de design

## ✅ Checklist avant PR

- [ ] Code TypeScript sans erreurs
- [ ] Pas de `any` types
- [ ] Callbacks mémoïsés
- [ ] Documentation JSDoc
- [ ] README mis à jour si nécessaire
- [ ] CHANGELOG mis à jour
- [ ] Testé manuellement
- [ ] Commits propres et descriptifs

## 🤝 Code Review

### Ce que nous recherchons

- **Clarté** : Le code est-il facile à comprendre ?
- **Performance** : Est-il optimisé ?
- **Typage** : Les types sont-ils corrects et complets ?
- **Réutilisabilité** : Le code peut-il être réutilisé ?
- **Tests** : Les changements sont-ils testables ?

### Feedback constructif

- Donner des exemples concrets
- Expliquer le "pourquoi"
- Proposer des alternatives
- Être respectueux et encourageant

## 📞 Questions ?

N'hésitez pas à :
- Ouvrir une issue pour discuter d'une idée
- Demander de l'aide dans une PR
- Proposer des améliorations à ce guide

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence MIT que le projet.

---

Merci pour votre contribution ! 🎉