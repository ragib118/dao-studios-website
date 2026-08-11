import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = getSafeNextPath(
    requestUrl.searchParams.get("next")
  );

  if (token_hash && type === "email") {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(
        new URL(next, request.url)
      );
    }

    console.error("Email confirmation error:", error);
  }

  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", request.url)
  );
}
