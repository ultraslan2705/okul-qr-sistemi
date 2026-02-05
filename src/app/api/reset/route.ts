import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { error: teachersError } = await supabase
    .from("teachers")
    .delete()
    .neq("id", "");

  if (teachersError) {
    return NextResponse.json(
      { error: "Teachers could not be deleted", details: teachersError.message },
      { status: 500 }
    );
  }

  const { error: settingsError } = await supabase
    .from("settings")
    .delete()
    .neq("id", 0);

  if (settingsError) {
    return NextResponse.json(
      { error: "Settings could not be deleted", details: settingsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
