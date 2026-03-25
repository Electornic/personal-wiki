import { getAuthorAccess } from "@/lib/wiki/auth";

import { SiteHeaderClient, type AuthStatus } from "@/components/site-header-client";

export async function SiteHeader() {
  const access = await getAuthorAccess();

  const initialAuthStatus: AuthStatus = access.configured
    ? access.isAuthenticated
      ? "authenticated"
      : "anonymous"
    : "anonymous";

  return <SiteHeaderClient initialAuthStatus={initialAuthStatus} />;
}
