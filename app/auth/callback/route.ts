import { NextResponse } from "next/server";

import { getOwnerEmail } from "@/lib/env";
import {
  getAdminSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/wiki/navigation";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await getServerSupabaseClient();

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ownerEmail = getOwnerEmail();

    if (user?.email && ownerEmail && user.email.toLowerCase() === ownerEmail) {
      const adminSupabase = getAdminSupabaseClient();

      if (adminSupabase) {
        await adminSupabase.from("author_profiles").upsert(
          {
            id: user.id,
            email: user.email.toLowerCase(),
          },
          { onConflict: "id" },
        );
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
