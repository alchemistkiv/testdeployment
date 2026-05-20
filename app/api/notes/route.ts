import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Backend: tüm notları getir
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Backend: yeni not ekle
export async function POST(request: Request) {
  const body = await request.json();
  const content = (body?.content ?? "").trim();

  if (!content) {
    return NextResponse.json({ error: "Boş not eklenemez" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({ content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
