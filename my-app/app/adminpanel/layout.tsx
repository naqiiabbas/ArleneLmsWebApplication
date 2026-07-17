import { PermissionsProvider } from "@/components/PermissionsProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PermissionsProvider>{children}</PermissionsProvider>;
}
