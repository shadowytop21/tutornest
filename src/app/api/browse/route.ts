import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

type FacetCounts = {
  subjects: Record<string, number>;
  grades: Record<string, number>;
  localities: Record<string, number>;
  boards: Record<string, number>;
  availability: Record<string, number>;
};

const FACET_CACHE_TTL_MS = 60_000;
let cachedFacetCounts: FacetCounts | null = null;
let cachedFacetCountsAt = 0;

function getMonthWindow() {
  const now = new Date();
  return {
    monthStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
    monthEnd: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString(),
  };
}

async function getFacetCounts(adminSupabase: any) {
  if (cachedFacetCounts && Date.now() - cachedFacetCountsAt < FACET_CACHE_TTL_MS) {
    return cachedFacetCounts;
  }

  const facets: FacetCounts = {
    subjects: {},
    grades: {},
    localities: {},
    boards: {},
    availability: {},
  };

  const { data: facetRows } = await adminSupabase
    .from("teacher_profiles")
    .select("subjects,grades,boards,locality,availability")
    .eq("status", "verified");

  for (const row of (facetRows ?? []) as any[]) {
    for (const value of (row.subjects ?? []) as string[]) {
      facets.subjects[value] = (facets.subjects[value] ?? 0) + 1;
    }

    for (const value of (row.grades ?? []) as string[]) {
      facets.grades[value] = (facets.grades[value] ?? 0) + 1;
    }

    for (const value of (row.boards ?? []) as string[]) {
      facets.boards[value] = (facets.boards[value] ?? 0) + 1;
    }

    for (const value of (row.availability ?? []) as string[]) {
      facets.availability[value] = (facets.availability[value] ?? 0) + 1;
    }

    if (row.locality) {
      facets.localities[row.locality] = (facets.localities[row.locality] ?? 0) + 1;
    }
  }

  cachedFacetCounts = facets;
  cachedFacetCountsAt = Date.now();
  return facets;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeFacets = searchParams.get("includeFacets") !== "0";
    const includeReviews = searchParams.get("includeReviews") === "1";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") ?? "12")));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const query = (searchParams.get("q") ?? "").trim().toLowerCase();
    const subject = (searchParams.get("subject") ?? "").trim();
    const grade = (searchParams.get("grade") ?? "").trim();
    const locality = (searchParams.get("locality") ?? "").trim();
    const board = (searchParams.get("board") ?? "").trim();
    const availability = (searchParams.get("availability") ?? "").trim();
    const priceMax = Number(searchParams.get("priceMax") ?? "0");

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ teachers: [], reviews: [], total: 0, page, pageSize: limit, offline: true });
    }

    const adminSupabase = supabase as any;
    let teacherQuery = adminSupabase
      .from("teacher_profiles")
      .select("id,user_id,handle,photo_url,bio,subjects,grades,boards,locality,price_per_month,teaches_at,availability,experience_years,whatsapp_number,status,is_founding_member,created_at", { count: "exact" })
      .eq("status", "verified")
      .order("status", { ascending: false })
      .range(start, end);

    if (subject) {
      teacherQuery = teacherQuery.contains("subjects", [subject]);
    }
    if (grade) {
      teacherQuery = teacherQuery.contains("grades", [grade]);
    }
    if (board) {
      teacherQuery = teacherQuery.contains("boards", [board]);
    }
    if (availability) {
      teacherQuery = teacherQuery.contains("availability", [availability]);
    }
    if (locality) {
      teacherQuery = teacherQuery.eq("locality", locality);
    }
    if (Number.isFinite(priceMax) && priceMax > 0) {
      teacherQuery = teacherQuery.lte("price_per_month", priceMax);
    }

    const { data: teacherRows, error: teacherError, count } = await teacherQuery;

    if (teacherError || !teacherRows) {
      return NextResponse.json({ teachers: [], reviews: [], total: 0, page, pageSize: limit, offline: true });
    }

    const userIds = teacherRows.map((row: any) => row.user_id).filter(Boolean);
    const teacherIds = teacherRows.map((row: any) => row.id).filter(Boolean);
    const { monthStart, monthEnd } = getMonthWindow();

    const [{ data: profileRows }, { data: reviewRows }, { data: contactRows }] = await Promise.all([
      userIds.length ? adminSupabase.from("profiles").select("id,name").in("id", userIds) : Promise.resolve({ data: [] }),
      teacherIds.length
        ? includeReviews
          ? adminSupabase.from("reviews").select("id,teacher_id,parent_id,rating,comment,created_at").in("teacher_id", teacherIds)
          : adminSupabase.from("reviews").select("teacher_id,rating").in("teacher_id", teacherIds)
        : Promise.resolve({ data: [] }),
      teacherIds.length
        ? adminSupabase
            .from("teacher_contact_requests")
            .select("teacher_id,created_at")
            .in("teacher_id", teacherIds)
            .gte("created_at", monthStart)
            .lt("created_at", monthEnd)
        : Promise.resolve({ data: [] }),
    ]);

    const monthlyContactCounts = new Map<string, number>();
    for (const row of (contactRows ?? []) as Array<{ teacher_id?: string }>) {
      if (!row.teacher_id) {
        continue;
      }

      monthlyContactCounts.set(row.teacher_id, (monthlyContactCounts.get(row.teacher_id) ?? 0) + 1);
    }

    const namesByUserId = new Map<string, string>(
      ((profileRows ?? []) as Array<{ id: string; name: string }>).map((row) => [row.id, row.name]),
    );

    const normalizedReviews: Array<{
      id: string;
      teacher_id: string;
      parent_id: string;
      parent_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }> = [];

    const teachers = (teacherRows as any[])
      .map((row) => {
      const reviewsCount = 0;
      const rating = 0;

      return {
        id: row.id,
        user_id: row.user_id,
        handle: row.handle ?? null,
        created_at: row.created_at,
        name: namesByUserId.get(row.user_id) ?? "Tutor",
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
        whatsapp_number: row.whatsapp_number ?? "",
        status: row.status,
        public_status: row.status,
        is_founding_member: Boolean(row.is_founding_member),
        is_resubmission: false,
        contactsThisMonth: monthlyContactCounts.get(row.id) ?? 0,
        rating,
        reviews_count: reviewsCount,
        reviewCount: reviewsCount,
      };
      })
      .filter((teacher) => {
        if (!query) {
          return true;
        }

        const searchable = [teacher.name, teacher.bio, teacher.locality, ...teacher.subjects, ...teacher.grades]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });

    teachers.sort((left, right) => {
      const leftCapped = (left.contactsThisMonth ?? 0) >= 15;
      const rightCapped = (right.contactsThisMonth ?? 0) >= 15;

      if (leftCapped !== rightCapped) {
        return leftCapped ? 1 : -1;
      }

      const leftVerified = left.status === "verified" || (left.public_status ?? "pending") === "verified";
      const rightVerified = right.status === "verified" || (right.public_status ?? "pending") === "verified";

      if (leftVerified !== rightVerified) {
        return leftVerified ? -1 : 1;
      }

      return right.rating - left.rating || left.price_per_month - right.price_per_month;
    });

    const facets = includeFacets ? await getFacetCounts(adminSupabase) : undefined;

    const response = NextResponse.json({ teachers, reviews: normalizedReviews, total: count ?? 0, page, pageSize: limit, ...(facets ? { facets } : {}), offline: false });
    response.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch {
    return NextResponse.json({ teachers: [], reviews: [], total: 0, page: 1, pageSize: 12, offline: true });
  }
}
