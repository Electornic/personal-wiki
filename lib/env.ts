const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const authRedirectUrl =
  process.env.SUPABASE_AUTH_REDIRECT_URL ?? "http://localhost:3000/auth/callback";

export function hasSupabaseEnv() {
  return Boolean(publicSupabaseUrl && publicSupabaseAnonKey);
}

export function hasSupabaseAdminEnv() {
  return Boolean(publicSupabaseUrl && serviceRoleKey);
}

export function hasAuthoringEnv() {
  return Boolean(publicSupabaseUrl && publicSupabaseAnonKey && serviceRoleKey);
}

export function getSupabasePublicEnv() {
  return {
    url: publicSupabaseUrl,
    anonKey: publicSupabaseAnonKey,
  };
}

export function getSupabaseAdminEnv() {
  return {
    url: publicSupabaseUrl,
    serviceRoleKey,
  };
}

export function getAuthRedirectUrl() {
  return authRedirectUrl;
}
