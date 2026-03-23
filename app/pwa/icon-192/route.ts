import { createPwaIconResponse } from "@/app/pwa/_lib/icon-image";

export const dynamic = "force-static";

export async function GET() {
  return createPwaIconResponse({ size: 192 });
}
