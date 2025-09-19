// src/components/AdminProvider.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname, notFound } from "next/navigation";
import { AdminContextProvider } from "../context/AdminContext";
import { PageSchema } from "../lib/pageSchema";

export function AdminProvider({
  config,
  children,
}: {
  config: any;
  children: ReactNode;
}) {
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/^\/admin/, "") || "/";

  const [initialData, setInitialData] = useState<any>(null);
  const [schema, setSchema] = useState<PageSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/get-page-data?pathname=${pathname}`);
        if (!response.ok) throw new Error("Page data not found");
        const data = await response.json();
        setInitialData(data.initialData);
        setSchema(data.schema);
      } catch (error) {
        setInitialData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <p>Chargement de l'éditeur...</p>
      </div>
    );
  }

  if (!initialData || !schema) {
    return notFound();
  }

  // Affiche la page publique (children) ET par-dessus, l'interface d'édition via PageBuilder
  return (
    <AdminContextProvider value={{ initialData, schema, pathname, config }}>
      {children}
    </AdminContextProvider>
  );
}
