export type UserRole = "teacher" | "parent";
export type TeacherStatus = "pending" | "verified" | "rejected";
export type TeachingMode = "student_home" | "teacher_home" | "both";

export type TeacherProfile = {
  id: string;
  user_id?: string;
  created_at?: string;
  public_status?: TeacherStatus;
  is_resubmission?: boolean;
  name: string;
  photo_url: string;
  bio: string;
  subjects: string[];
  grades: string[];
  boards: string[];
  locality: string;
  price_per_month: number;
  teaches_at: TeachingMode;
  availability: string[];
  experience_years: number;
  whatsapp_number: string;
  status: TeacherStatus;
  is_founding_member: boolean;
  rating: number;
  reviews_count: number;
  reviewCount?: number;
};

export type Review = {
  id: string;
  teacher_id: string;
  parent_id?: string;
  parent_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type TeacherRecord = TeacherProfile;

export type ReviewRecord = Review;

export type Role = UserRole;

export type TeachAt = TeachingMode;

export type SessionRecord = {
  id: string;
  phone: string;
  name: string;
  email: string;
  role?: UserRole;
};

export type ProfileRecord = {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
};

export type TeacherFilters = {
  query?: string;
  subject?: string;
  grade?: string;
  locality?: string;
  board?: string;
  availability?: string;
  priceMax?: number;
  includePending?: boolean;
};

export type SubjectCategory = {
  subject: string;
  description: string;
  icon: string;
  count: number;
};

export type TeacherSubmission = {
  id: string;
  profile: Omit<TeacherProfile, "rating" | "reviews_count">;
  role: UserRole;
  name: string;
  phone: string;
  status: TeacherStatus;
  created_at: string;
};

export const teacherSubjects = [
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "Sanskrit",
  "Computer Science",
  "Economics",
  "Accountancy",
];

export const gradeOptions = [
  "Class 1-5",
  "Class 6-8",
  "Class 9-10",
  "Class 11-12",
  "Competitive Exams",
];

export const boardOptions = ["CBSE", "UP Board", "ICSE"];

export const localityOptions = [
  "Vrindavan",
  "Civil Lines",
  "Krishna Nagar",
  "Dampier Nagar",
  "Sadar Bazaar",
  "Nagla Padam",
  "Bengali Ghat",
  "Govind Nagar",
  "Mandi",
  "Shastri Nagar",
  "Tilak Nagar",
  "Ramghat",
  "Highway Colony",
  "Arjun Nagar",
  "Other",
];

export const availabilityOptions = ["Morning", "Evening", "Weekend"];

export const teachingModes: Array<{ label: string; value: TeachingMode }> = [
  { label: "Student's home", value: "student_home" },
  { label: "My home", value: "teacher_home" },
  { label: "Both", value: "both" },
];

export const subjectCategories: SubjectCategory[] = [
  {
    subject: "Maths",
    description: "Foundational learning to competitive exam preparation.",
    icon: "∑",
    count: 18,
  },
  {
    subject: "Science",
    description: "Integrated support for concepts, labs, and projects.",
    icon: "◌",
    count: 14,
  },
  {
    subject: "English",
    description: "Reading, grammar, writing, and speaking confidence.",
    icon: "Aa",
    count: 12,
  },
  {
    subject: "Physics",
    description: "Board mastery and problem-solving for classes 9-12.",
    icon: "Δ",
    count: 9,
  },
  {
    subject: "Chemistry",
    description: "Equation handling, theory, and exam revision plans.",
    icon: "≋",
    count: 8,
  },
  {
    subject: "Biology",
    description: "Clear diagrams, NCERT coverage, and revision notes.",
    icon: "✿",
    count: 7,
  },
  {
    subject: "Accountancy",
    description: "Practical support for commerce students.",
    icon: "₹",
    count: 6,
  },
  {
    subject: "Computer Science",
    description: "Coding and fundamentals for modern school curricula.",
    icon: "</>",
    count: 5,
  },
];

export const seedTeachers: TeacherProfile[] = [];

export const seedReviews: Review[] = [];

export const localStorageKeys = {
  profile: "docent_profile",
  teacherDraft: "docent_teacher_draft",
  parentDraft: "docent_parent_draft",
  teacherCatalog: "docent_local_teachers",
  teacherReviewsPrefix: "docent_teacher_reviews_",
};

export function buildWhatsAppLink(number: string, message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

export function featuredTeachers(catalog: TeacherProfile[] = seedTeachers) {
  return [...catalog].sort((left, right) => right.rating - left.rating);
}

export function teacherById(id: string, catalog: TeacherProfile[] = seedTeachers) {
  return catalog.find((teacher) => teacher.id === id);
}

export function filterTeachers(
  catalog: TeacherProfile[],
  filters: {
    query?: string;
    subject?: string;
    grade?: string;
    locality?: string;
    board?: string;
    availability?: string;
    priceMax?: number;
  },
) {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return catalog.filter((teacher) => {
    const matchesQuery =
      !query ||
      [teacher.name, teacher.bio, teacher.locality, ...teacher.subjects, ...teacher.grades]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesSubject = !filters.subject || teacher.subjects.includes(filters.subject);
    const matchesGrade = !filters.grade || teacher.grades.includes(filters.grade);
    const matchesLocality = !filters.locality || teacher.locality === filters.locality;
    const matchesBoard = !filters.board || teacher.boards.includes(filters.board);
    const matchesAvailability = !filters.availability || teacher.availability.includes(filters.availability);
    const matchesPrice = !filters.priceMax || teacher.price_per_month <= filters.priceMax;

    return (
      matchesQuery &&
      matchesSubject &&
      matchesGrade &&
      matchesLocality &&
      matchesBoard &&
      matchesAvailability &&
      matchesPrice
    );
  });
}

export function createSubmissionId(name: string) {
  return `teacher-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;
}

export function getTeacherReviews(teacherId: string) {
  return seedReviews.filter((review) => review.teacher_id === teacherId);
}

export function countTeacherReviews(teacherId: string) {
  return getTeacherReviews(teacherId).length;
}

export function subjectStats(catalog: TeacherProfile[] = seedTeachers) {
  return subjectCategories.map((category) => ({
    ...category,
    count: catalog.filter((teacher) => teacher.subjects.includes(category.subject)).length,
  }));
}

export const seedProfiles: ProfileRecord[] = [];

export const subjectOptions = teacherSubjects;

export const subjectSearchSuggestions = [
  "Maths for Class 9",
  "Physics in Krishna Nagar",
  "CBSE tutors near Civil Lines",
  "English home tuition",
];

export function buildTeacherView(teacher: TeacherProfile, reviews: Review[] = seedReviews) {
  const teacherReviews = reviews.filter((review) => review.teacher_id === teacher.id);
  const reviewCount = teacherReviews.length || teacher.reviews_count;
  const rating = teacherReviews.length
    ? Math.round((teacherReviews.reduce((total, review) => total + review.rating, 0) / teacherReviews.length) * 10) / 10
    : teacher.rating;

  return {
    ...teacher,
    rating,
    reviews_count: reviewCount,
  };
}

export function computeFilteredTeachers(
  catalog: TeacherProfile[] = seedTeachers,
  filters: {
    query?: string;
    subject?: string;
    grade?: string;
    locality?: string;
    board?: string;
    availability?: string;
    priceMax?: number;
    includePending?: boolean;
  } = {},
  reviews = seedReviews,
) {
  const includePending = Boolean(filters.includePending);
  const publicCatalog = catalog.filter(
    (teacher) => {
      const status = teacher.public_status ?? teacher.status;

      if (status === "verified" || teacher.status === "verified") {
        return true;
      }

      if (includePending && (status === "pending" || teacher.status === "pending")) {
        return true;
      }

      return false;
    },
  );
  const filtered = filterTeachers(publicCatalog, filters);

  return filtered
    .map((teacher) => {
      const teacherReviews = reviews.filter((review) => review.teacher_id === teacher.id);
      const reviewCount = teacherReviews.length || teacher.reviews_count;
      const rating = teacherReviews.length
        ? Math.round((teacherReviews.reduce((total, review) => total + review.rating, 0) / teacherReviews.length) * 10) / 10
        : teacher.rating;

      return {
        ...teacher,
        rating,
        reviews_count: reviewCount,
      };
    })
    .sort((left, right) => {
      const leftVerified = left.status === "verified" || (left.public_status ?? "pending") === "verified";
      const rightVerified = right.status === "verified" || (right.public_status ?? "pending") === "verified";

      if (leftVerified !== rightVerified) {
        return leftVerified ? -1 : 1;
      }

      return right.rating - left.rating || left.price_per_month - right.price_per_month;
    });
}
