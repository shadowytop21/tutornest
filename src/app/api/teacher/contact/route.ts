import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

type ContactRequest = {
  teacherId?: string;
  parentId?: string;
};

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const rateLimit = checkRateLimit(`teacher-contact:${ip}`, 30, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ message: "Too many contact attempts. Please try again later." }, { status: 429 });
    }

    const payload = (await request.json().catch(() => null)) as ContactRequest | null;
    if (!payload?.teacherId || !payload?.parentId) {
      return NextResponse.json({ message: "Missing contact fields." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ message: "Server database is not configured." }, { status: 503 });
    }

    const adminSupabase = supabase as any;
    const { data: teacher, error: teacherError } = await adminSupabase
      .from("teacher_profiles")
      .select("id,user_id,whatsapp_number,status")
      .eq("id", payload.teacherId)
      .maybeSingle();

    if (teacherError) {
      return NextResponse.json({ message: teacherError.message }, { status: 500 });
    }

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found." }, { status: 404 });
    }

    if (teacher.status !== "verified") {
      return NextResponse.json({ message: "This profile is under review." }, { status: 403 });
    }

    if (teacher.user_id === payload.parentId) {
      return NextResponse.json({ message: "You cannot contact your own profile." }, { status: 403 });
    }

    const { data: parentProfile, error: parentError } = await adminSupabase
      .from("profiles")
      .select("id,role")
      .eq("id", payload.parentId)
      .maybeSingle();

    if (parentError) {
      return NextResponse.json({ message: parentError.message }, { status: 500 });
    }

    if (!parentProfile || parentProfile.role !== "parent") {
      return NextResponse.json({ message: "Only parents can contact teachers." }, { status: 403 });
    }

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();

    const { data: monthlyRequests, error: monthlyError } = await adminSupabase
      .from("teacher_contact_requests")
      .select("id", { count: "exact" })
      .eq("teacher_id", teacher.id)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);

    if (monthlyError) {
      return NextResponse.json({ message: monthlyError.message }, { status: 500 });
    }

    if ((monthlyRequests?.length ?? 0) >= 15) {
      return NextResponse.json({ message: "This teacher has reached the 15 enquiries per month limit." }, { status: 429 });
    }

    const insertResult = await adminSupabase.from("teacher_contact_requests").insert({
      teacher_id: teacher.id,
      parent_id: parentProfile.id,
      ip_address: ip && ip !== "unknown" ? ip : null,
    });

    if (insertResult.error) {
      return NextResponse.json({ message: insertResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, whatsappNumber: teacher.whatsapp_number ?? "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch contact details.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
