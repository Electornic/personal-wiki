import { NextRequest } from "next/server";

import { respondWithRecordImage } from "@/app/api/record-images/_lib/respond-with-record-image";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token") ?? "";
  return respondWithRecordImage(request, { token });
}
