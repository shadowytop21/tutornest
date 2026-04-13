import { AdminPanel } from "@/components/admin-panel";

export default function AdminPage() {
  return <AdminPanel adminEmail={process.env.ADMIN_EMAIL ?? ""} />;
}
