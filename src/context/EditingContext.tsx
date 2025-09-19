"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { PageSchema } from "../lib/pageSchema";

type ActiveSectionPath = string | null;

interface EditingContextType {
  activeSectionPath: ActiveSectionPath;
  setActiveSection: (path: string) => void;
  clearActiveSection: () => void;
  pageSchema: PageSchema;
  config: any;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export const EditingProvider = ({
  children,
  schema,
  config,
}: {
  children: ReactNode;
  schema: PageSchema;
  config: any;
}) => {
  const [activeSectionPath, setActiveSectionPath] =
    useState<ActiveSectionPath>(null);

  const setActiveSection = (path: string) => setActiveSectionPath(path);
  const clearActiveSection = () => setActiveSectionPath(null);

  return (
    <EditingContext.Provider
      value={{
        activeSectionPath,
        setActiveSection,
        clearActiveSection,
        pageSchema: schema,
        config,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
};

export const useEditing = () => {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error("useEditing must be used within an EditingProvider");
  }
  return context;
};
