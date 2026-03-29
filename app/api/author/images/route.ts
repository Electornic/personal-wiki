import { NextRequest, NextResponse } from "next/server";

import { getAdminSupabaseClient, getRouteHandlerSupabaseClient } from "@/shared/api/supabase/server";
import {
  buildRecordImagePath,
  buildRecordImageProxyUrl,
  buildRecordImageToken,
  getRecordImageAltText,
  isRecordImageMimeType,
  RECORD_IMAGE_MAX_BYTES,
} from "@/lib/wiki/record-images";

export async function POST(request: NextRequest) {
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

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to upload images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!isRecordImageMimeType(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WebP images are supported." },
      { status: 400 },
    );
  }

  if (file.size > RECORD_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Images must be 10MB or smaller." },
      { status: 400 },
    );
  }

  const path = buildRecordImagePath(user.id, file.type);
  const { error } = await adminSupabase.storage
    .from("record-images")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const token = buildRecordImageToken(path);

  return NextResponse.json({
    token,
    imageUrl: buildRecordImageProxyUrl(token),
    alt: getRecordImageAltText(file.name),
  });
}
