import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RouteContext = {
  params: {
    id?: string;
  };
};

export async function DELETE(_request: Request, context: RouteContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const id = context.params?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { error } = await supabase.from("teachers").delete().eq("id", id);

  if (error) {
    console.error("SUPABASE_DELETE_ERROR", error);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, context: RouteContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const id = context.params?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.from("teachers").select("*").eq("id", id).single();

  if (error || !data) {
    const status = error?.code === "PGRST116" ? 404 : 500;
    console.error("SUPABASE_GET_TEACHER_ERROR", error);
    return NextResponse.json(
      {
        error: error?.message ?? "Teacher not found",
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      },
      { status }
    );
  }

  return NextResponse.json({ teacher: data });
}
