// src/components/AdminUI.tsx
"use client";

import { useAdmin } from "../context/AdminContext";
import { PageBuilder } from "./PageBuilder";
import { AdminToolbar } from "./AdminToolbar";
import { ComponentType } from "react";
import { NotificationProvider } from "../context/NotificationContext";
import { ConfirmationProvider } from "../context/ConfirmationContext";

export function AdminUI({
  BlockRenderer,
  HeaderComponent,
  FooterComponent,
  UserToolbarComponent,
}: {
  BlockRenderer: ComponentType<{ block: any }>;
  HeaderComponent: ComponentType<{ headerData: any }>;
  FooterComponent: ComponentType<{ footerData: any }>;
  UserToolbarComponent?: ComponentType;
}) {
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
