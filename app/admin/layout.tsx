import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verify the authenticated user on the server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // No valid authenticated user
  if (userError || !user) {
    redirect("/login");
  }

  // Check whether this user is an owner/admin
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // No admin record or database error
  if (adminError || !adminUser) {
    redirect("/");
  }

  // Only owners are allowed into the admin panel
  if (adminUser.role !== "owner") {
    redirect("/");
  }

  // User is authenticated and authorized
  return <>{children}</>;
}