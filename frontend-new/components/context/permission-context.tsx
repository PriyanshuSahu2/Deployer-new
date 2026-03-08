"use client";

import { createContext, useContext } from "react";

const PermissionContext = createContext<Set<string>>(new Set());

export function PermissionProvider({
  permissions,
  children,
}: {
  permissions: Set<string>;
  children: React.ReactNode;
}) {
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  return useContext(PermissionContext);
}