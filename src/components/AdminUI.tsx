// src/components/AdminUI.tsx
"use client";

import { ComponentType } from "react";
import { useAdmin } from "../context/AdminContext";
import { PageBuilder } from "./PageBuilder";
import { AdminToolbar } from "./AdminToolbar";
import { NotificationProvider } from "../context/NotificationContext";
import { ConfirmationProvider } from "../context/ConfirmationContext";
import { BlockData } from "../lib/pageSchema";

/**
 * Props pour le composant de rendu de bloc
 */
interface BlockRendererProps {
    block: BlockData;
}

/**
 * Props pour le composant de header
 */
interface HeaderComponentProps {
    headerData: Record<string, unknown>;
}

/**
 * Props pour le composant de footer
 */
interface FooterComponentProps {
    footerData: Record<string, unknown>;
}

/**
 * Props du composant AdminUI
 */
interface AdminUIProps {
    BlockRenderer: ComponentType<BlockRendererProps>;
    HeaderComponent: ComponentType<HeaderComponentProps>;
    FooterComponent: ComponentType<FooterComponentProps>;
    UserToolbarComponent?: ComponentType;
}

/**
 * AdminUI - Composant principal de l'interface d'administration
 * Combine les providers de notification et confirmation avec le PageBuilder
 *
 * @param BlockRenderer - Composant pour rendre les blocs de contenu
 * @param HeaderComponent - Composant pour rendre le header
 * @param FooterComponent - Composant pour rendre le footer
 * @param UserToolbarComponent - Composant optionnel pour une barre d'outils personnalisée
 */
export function AdminUI({
    BlockRenderer,
    HeaderComponent,
    FooterComponent,
    UserToolbarComponent,
}: AdminUIProps) {
    const { initialData, schema, pathname, config } = useAdmin();

    return (
        <NotificationProvider>
            <ConfirmationProvider>
                <PageBuilder
                    initialData={initialData}
                    schema={schema}
                    pathname={pathname}
                    config={config}
                    BlockRenderer={BlockRenderer}
                    HeaderComponent={HeaderComponent}
                    FooterComponent={FooterComponent}
                />
                <AdminToolbar UserToolbarComponent={UserToolbarComponent} />
            </ConfirmationProvider>
        </NotificationProvider>
    );
}
