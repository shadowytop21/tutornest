import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ teachers: [], profiles: [], reviews: [], offline: true });
    }

    const [teacherResponse, profileResponse, reviewResponse] = await Promise.all([
      supabase
        .from("teacher_profiles")
        .select("id,user_id,handle,photo_url,bio,subjects,grades,boards,locality,price_per_month,teaches_at,availability,experience_years,whatsapp_number,status,is_founding_member,created_at"),
      supabase.from("profiles").select("id,role,name,phone,created_at"),
      supabase.from("reviews").select("id,teacher_id,parent_id,rating,comment,created_at"),
    ]);

    if (teacherResponse.error || profileResponse.error || reviewResponse.error) {
      return NextResponse.json({ teachers: [], profiles: [], reviews: [], offline: true });
    }

  const teacherRows = (teacherResponse.data ?? []) as any[];
  const profileRows = (profileResponse.data ?? []) as any[];
  const reviewRows = (reviewResponse.data ?? []) as any[];

  const profileById = new Map<string, { name: string; phone: string; role: "teacher" | "parent"; created_at: string }>(
    profileRows.map((row) => [
      row.id,
      {
        name: row.name ?? "",
        phone: row.phone ?? "",
        role: row.role,
        created_at: row.created_at ?? new Date().toISOString(),
      },
    ]),
  );

  const teachers = teacherRows.map((row) => {
    const profile = profileById.get(row.user_id);
    const reviewsCount = 0;
    const rating = 0;

    return {
      id: row.id,
      user_id: row.user_id,
      handle: row.handle ?? null,
      name: profile?.name ?? "Tutor",
      photo_url: row.photo_url ?? "",
      bio: row.bio ?? "",
      subjects: row.subjects ?? [],
      grades: row.grades ?? [],
      boards: row.boards ?? [],
      locality: row.locality ?? "",
      price_per_month: row.price_per_month ?? 0,
      teaches_at: row.teaches_at,
      availability: row.availability ?? [],
      experience_years: row.experience_years ?? 0,
      whatsapp_number: row.whatsapp_number ?? profile?.phone ?? "",
      status: row.status,
      public_status: row.status,
      is_resubmission: false,
      is_founding_member: Boolean(row.is_founding_member),
      created_at: row.created_at ?? new Date().toISOString(),
      rating,
      reviews_count: reviewsCount,
      reviewCount: reviewsCount,
    };
  });

  const profiles = profileRows.map((row) => ({
    id: row.id,
    role: row.role,
    name: row.name ?? "",
    phone: row.phone ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
  }));

  const reviews: Array<{
    id: string;
    teacher_id: string;
    parent_id: string;
    parent_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }> = [];

    return NextResponse.json({
      teachers,
      profiles,
      reviews,
      offline: false,
    });
  } catch {
    return NextResponse.json({ teachers: [], profiles: [], reviews: [], offline: true });
  }
}
