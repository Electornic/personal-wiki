import { getAuthStatus } from "@/lib/wiki/auth";

import { SiteHeaderClient, type AuthStatus } from "@/components/site-header-client";

export async function SiteHeader() {
  const authStatus = await getAuthStatus();

  const initialAuthStatus: AuthStatus = authStatus.configured
    ? authStatus.isAuthenticated
      ? "authenticated"
      : "anonymous"
    : "anonymous";

  return <SiteHeaderClient initialAuthStatus={initialAuthStatus} />;
}
