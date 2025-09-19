"use client";

import { createContext, useContext, ReactNode } from 'react';
import { PageSchema } from '../lib/pageSchema';

interface AdminContextType {
  initialData: any;
  schema: PageSchema;
  pathname: string;
  config: any;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminContextProvider = ({ value, children }: { value: AdminContextType, children: ReactNode }) => {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminContextProvider');
  }
  return context;
};