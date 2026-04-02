import { PermissionProvider } from "@/components/context/permission-context";
import { ReactNode } from "react";

async function getPermissions(workspaceId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/workspaces/${workspaceId}/me/permissions`,
    { next: { revalidate: 60 } }
  );

  return res.json();
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const data = await getPermissions(workspaceId);

  const permissionSet = new Set<string>(data.permissions);

  return (
    <PermissionProvider permissions={permissionSet}>
      {children}
    </PermissionProvider>
  );
}