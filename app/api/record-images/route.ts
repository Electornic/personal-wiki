import { NextRequest, NextResponse } from "next/server";

import { getAdminSupabaseClient, getRouteHandlerSupabaseClient } from "@/shared/api/supabase/server";
import { parseRecordImageToken } from "@/lib/wiki/record-images";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token") ?? "";
  const parsed = parseRecordImageToken(token);

  if (!parsed) {
    return NextResponse.json({ error: "Invalid image token." }, { status: 400 });
  }

  const response = NextResponse.next();
  const supabase = getRouteHandlerSupabaseClient(
    request,
    response,
  );
  const adminSupabase = getAdminSupabaseClient();

  if (!supabase || !adminSupabase) {
    return NextResponse.json(
      { error: "Supabase server configuration is missing." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownsImage = user ? parsed.path.startsWith(`${user.id}/`) : false;

  let canRead = ownsImage;

  if (!canRead) {
    const publicRecordLookup = await adminSupabase
      .from("records")
      .select("id")
      .eq("visibility", "public")
      .ilike("contents", `%${parsed.token}%`)
      .limit(1);

    canRead = Boolean(publicRecordLookup.data?.length);
  }

  if (!canRead) {
    return NextResponse.json({ error: "Image could not be found." }, { status: 404 });
  }

  const signed = await adminSupabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, 60 * 60);

  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: signed.error?.message ?? "Unable to load image." }, { status: 500 });
  }

  const redirectResponse = NextResponse.redirect(signed.data.signedUrl, {
    status: 307,
  });

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  redirectResponse.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=60");

  return redirectResponse;
}
