import { NextRequest } from "next/server";

import { respondWithRecordImage } from "@/app/api/record-images/_lib/respond-with-record-image";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  return respondWithRecordImage(request, { path });
}
