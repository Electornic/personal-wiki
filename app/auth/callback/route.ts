import { NextRequest, NextResponse } from "next/server";

import {
  getAdminSupabaseClient,
  getRouteHandlerSupabaseClient,
} from "@/shared/api/supabase/server";
import { sanitizeNextPath } from "@/lib/wiki/navigation";
import { upsertProfileRow } from "@/lib/wiki/profiles";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabase = getRouteHandlerSupabaseClient(request, response);

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      const adminSupabase = getAdminSupabaseClient();

      if (adminSupabase) {
        await upsertProfileRow(adminSupabase, {
          id: user.id,
          email: user.email.toLowerCase(),
          userName:
            typeof user.user_metadata?.user_name === "string"
              ? user.user_metadata.user_name
              : null,
        });
      }
    }
  }

  return response;
}
