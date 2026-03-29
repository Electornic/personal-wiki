import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct image upload is no longer supported on this route." },
    { status: 410 },
  );
}
