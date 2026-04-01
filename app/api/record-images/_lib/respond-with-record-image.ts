import { NextRequest, NextResponse } from "next/server";

import { buildRecordImageToken, parseRecordImageToken } from "@/lib/wiki/record-images";
import { getAdminSupabaseClient, getRouteHandlerSupabaseClient } from "@/shared/api/supabase/server";

export async function respondWithRecordImage(
  request: NextRequest,
  tokenOrPath: { token?: string; path?: string[] },
) {
  const token = tokenOrPath.token
    ?? (tokenOrPath.path?.length
      ? buildRecordImageToken(tokenOrPath.path.join("/"))
      : "");
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

  const download = await adminSupabase.storage
    .from(parsed.bucket)
    .download(parsed.path);

  if (download.error || !download.data) {
    return NextResponse.json({ error: download.error?.message ?? "Unable to load image." }, { status: 500 });
  }

  const imageBuffer = await download.data.arrayBuffer();
  const imageResponse = new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": download.data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
    },
  });

  response.cookies.getAll().forEach((cookie) => {
    imageResponse.cookies.set(cookie);
  });

  return imageResponse;
}
