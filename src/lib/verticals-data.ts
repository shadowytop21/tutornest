export type VerticalStatus = "pending" | "verified" | "rejected";

export const coachingExamTypes = [
  "JEE Mains",
  "JEE Advanced",
  "NEET",
  "Class 10 Boards",
  "Class 12 Boards",
  "Foundation",
  "Olympiad",
  "Other",
] as const;

export type CoachingExamType = (typeof coachingExamTypes)[number];

export type CoachingCourse = {
  id: string;
  name: string;
  examType: CoachingExamType;
  duration: string;
  batchSize: number;
  schedule: string;
  feePerYear: number;
};

export type CoachingInstitute = {
  id: string;
  name: string;
  tagline: string;
  about: string;
  logoUrl: string;
  establishedYear: number;
  phone: string;
  website: string;
  examTypes: CoachingExamType[];
  courses: CoachingCourse[];
  facultyCount: number;
  batchSizeMin: number;
  batchSizeMax: number;
  timings: string;
  locality: string;
  fullAddress: string;
  feeRangeMin: number;
  feeRangeMax: number;
  verificationDocumentName: string;
  status: VerticalStatus;
  rating: number;
  reviewsCount: number;
  students: number;
  iitSelections: number;
  neetSelections: number;
  passRate: number;
  bestRank: string;
  faculty: Array<{ id: string; name: string; subject: string; experienceYears: number }>;
  highlights: string[];
  featured: boolean;
  createdAt: string;
};

export type SchoolBoard = "CBSE" | "ICSE" | "UP Board" | "IB" | "IGCSE";

export type SchoolType = "Co-Education" | "Girls Only" | "Boys Only";

export type ClassLevel =
  | "Nursery"
  | "KG"
  | "Class 1"
  | "Class 2"
  | "Class 3"
  | "Class 4"
  | "Class 5"
  | "Class 6"
  | "Class 7"
  | "Class 8"
  | "Class 9"
  | "Class 10"
  | "Class 11"
  | "Class 12";

export type SchoolClassFee = {
  id: string;
  label: string;
  annualFee: number;
};

export type SchoolRecord = {
  id: string;
  name: string;
  tagline: string;
  about: string;
  logoUrl: string;
  establishedYear: number;
  boards: SchoolBoard[];
  schoolType: SchoolType;
  affiliationNumber: string;
  classesFrom: ClassLevel;
  classesTo: ClassLevel;
  classesRange: string;
  locality: string;
  fullAddress: string;
  annualFeeMin: number;
  annualFeeMax: number;
  facilities: SchoolFacility[];
  classFees: SchoolClassFee[];
  studentCount: number;
  teacherCount: number;
  schoolHours: string;
  transportAvailable: boolean;
  transportFee: number;
  admissionOpen: boolean;
  admissionDeadline: string;
  gallery: string[];
  contactPhone: string;
  website: string;
  verificationDocumentName?: string;
  status: VerticalStatus;
  rating: number;
  reviewsCount: number;
  students: number;
  teachers: number;
  featured: boolean;
  createdAt: string;
};

export type SchoolFacility =
  | "Science Labs"
  | "Computer Labs"
  | "Smart Classrooms"
  | "Library"
  | "Sports Ground"
  | "Swimming Pool"
  | "Transport"
  | "Arts & Music"
  | "Auditorium"
  | "Canteen";

export const schoolBoardOptions: SchoolBoard[] = ["CBSE", "ICSE", "UP Board", "IB", "IGCSE"];

export const schoolTypeOptions: SchoolType[] = ["Co-Education", "Girls Only", "Boys Only"];

export const classLevelOptions: ClassLevel[] = [
  "Nursery",
  "KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export const seedCoachingInstitutes: CoachingInstitute[] = [
  {
    id: "coaching-aakash-mathura",
    name: "Aakash Institute",
    tagline: "Mathura's top JEE & NEET coaching centre",
    about:
      "Aakash Institute Mathura is one of the city's most established coaching centres for JEE and NEET preparation. Founded in 2004, this centre focuses on rigorous test series, daily doubt resolution, and structured mentoring for long-term rank improvement.",
    logoUrl: "",
    establishedYear: 2004,
    phone: "9876543210",
    website: "https://example.com/aakash-mathura",
    examTypes: ["JEE Mains", "JEE Advanced", "NEET", "Foundation"],
    courses: [
      { id: "c1", name: "JEE Mains", examType: "JEE Mains", duration: "2 Years", batchSize: 25, schedule: "Mon-Sat, 4 hrs/day", feePerYear: 85000 },
      { id: "c2", name: "JEE Advanced", examType: "JEE Advanced", duration: "2 Years", batchSize: 25, schedule: "Mon-Sat, 4 hrs/day", feePerYear: 90000 },
      { id: "c3", name: "NEET", examType: "NEET", duration: "2 Years", batchSize: 25, schedule: "Mon-Sat, 4 hrs/day", feePerYear: 80000 },
      { id: "c4", name: "Foundation", examType: "Foundation", duration: "1 Year", batchSize: 30, schedule: "Mon-Fri, 2 hrs/day", feePerYear: 35000 },
    ],
    facultyCount: 25,
    batchSizeMin: 25,
    batchSizeMax: 30,
    timings: "Mon-Sat, 6AM-8PM",
    locality: "Civil Lines",
    fullAddress: "Civil Lines, Mathura, Uttar Pradesh",
    feeRangeMin: 35000,
    feeRangeMax: 90000,
    verificationDocumentName: "Aakash Registration Certificate.pdf",
    status: "verified",
    rating: 4.8,
    reviewsCount: 124,
    students: 2400,
    iitSelections: 340,
    neetSelections: 520,
    passRate: 98,
    bestRank: "AIR 247",
    faculty: [
      { id: "f1", name: "R. Verma", subject: "Physics", experienceYears: 14 },
      { id: "f2", name: "S. Joshi", subject: "Chemistry", experienceYears: 11 },
      { id: "f3", name: "A. Tripathi", subject: "Biology", experienceYears: 9 },
    ],
    highlights: ["Verified", "Featured", "Small batches", "Result-focused"],
    featured: true,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "coaching-resonance-mathura",
    name: "Resonance Eduventures",
    tagline: "Strong JEE preparation with disciplined batches",
    about:
      "Resonance Mathura supports engineering aspirants with focused classroom training, weekly assessments, and consistent progress reports for parents.",
    logoUrl: "",
    establishedYear: 2010,
    phone: "9123456789",
    website: "https://example.com/resonance-mathura",
    examTypes: ["JEE Mains", "JEE Advanced", "Class 12 Boards"],
    courses: [
      { id: "r1", name: "JEE Mains", examType: "JEE Mains", duration: "2 Years", batchSize: 35, schedule: "Mon-Sat, 3 hrs/day", feePerYear: 65000 },
      { id: "r2", name: "JEE Advanced", examType: "JEE Advanced", duration: "2 Years", batchSize: 30, schedule: "Mon-Sat, 3 hrs/day", feePerYear: 70000 },
      { id: "r3", name: "Board Prep", examType: "Class 12 Boards", duration: "1 Year", batchSize: 40, schedule: "Mon-Fri, 2 hrs/day", feePerYear: 42000 },
    ],
    facultyCount: 15,
    batchSizeMin: 30,
    batchSizeMax: 60,
    timings: "Mon-Sat, 7AM-7PM",
    locality: "Krishna Nagar",
    fullAddress: "Krishna Nagar, Mathura, Uttar Pradesh",
    feeRangeMin: 42000,
    feeRangeMax: 70000,
    verificationDocumentName: "Resonance Affiliation.pdf",
    status: "verified",
    rating: 4.5,
    reviewsCount: 87,
    students: 1200,
    iitSelections: 180,
    neetSelections: 140,
    passRate: 95,
    bestRank: "AIR 612",
    faculty: [
      { id: "rf1", name: "M. Khanna", subject: "Mathematics", experienceYears: 12 },
      { id: "rf2", name: "N. Gupta", subject: "Physics", experienceYears: 10 },
    ],
    highlights: ["Verified", "JEE Focus", "Test analytics"],
    featured: false,
    createdAt: "2026-04-01T12:00:00.000Z",
  },
];

export const schoolFacilities: SchoolFacility[] = [
  "Science Labs",
  "Computer Labs",
  "Smart Classrooms",
  "Library",
  "Sports Ground",
  "Swimming Pool",
  "Transport",
  "Arts & Music",
  "Auditorium",
  "Canteen",
] as const;

export const seedSchools: SchoolRecord[] = [
  {
    id: "school-st-dominics-mathura",
    name: "St. Dominic's Senior Secondary School",
    tagline: "One of Mathura's most trusted CBSE schools",
    about:
      "St. Dominic's is a respected CBSE institution in Mathura known for strong academics, disciplined culture, and holistic student development from nursery to senior secondary.",
    logoUrl: "",
    establishedYear: 1984,
    boards: ["CBSE"],
    schoolType: "Co-Education",
    affiliationNumber: "2100143",
    classesFrom: "Nursery",
    classesTo: "Class 12",
    classesRange: "Nursery - Class 12",
    locality: "Civil Lines",
    fullAddress: "Civil Lines, Mathura, Uttar Pradesh",
    annualFeeMin: 28000,
    annualFeeMax: 55000,
    facilities: ["Science Labs", "Computer Labs", "Smart Classrooms", "Library", "Sports Ground", "Transport", "Arts & Music", "Auditorium"],
    classFees: [
      { id: "sd1", label: "Nursery-KG", annualFee: 28000 },
      { id: "sd2", label: "Class 1-5", annualFee: 36000 },
      { id: "sd3", label: "Class 6-8", annualFee: 42000 },
      { id: "sd4", label: "Class 9-10", annualFee: 48000 },
      { id: "sd5", label: "Class 11-12", annualFee: 52000 },
    ],
    studentCount: 2800,
    teacherCount: 120,
    schoolHours: "7:30 AM - 2:30 PM",
    transportAvailable: true,
    transportFee: 8000,
    admissionOpen: true,
    admissionDeadline: "2026-05-31",
    gallery: ["🏫", "🔬", "💻", "🏃", "📚"],
    contactPhone: "9012345678",
    website: "https://example.com/st-dominics",
    status: "verified",
    rating: 4.7,
    reviewsCount: 86,
    students: 2800,
    teachers: 120,
    featured: true,
    createdAt: "2026-04-01T11:00:00.000Z",
  },
  {
    id: "school-dps-mathura",
    name: "Delhi Public School Mathura",
    tagline: "Premium CBSE learning with modern infrastructure",
    about:
      "DPS Mathura offers strong academics, science and arts streams, and extensive co-curricular activities with a modern campus setup.",
    logoUrl: "",
    establishedYear: 1999,
    boards: ["CBSE"],
    schoolType: "Co-Education",
    affiliationNumber: "2134021",
    classesFrom: "Class 1",
    classesTo: "Class 12",
    classesRange: "Class 1 - 12",
    locality: "Dampier Nagar",
    fullAddress: "Dampier Nagar, Mathura, Uttar Pradesh",
    annualFeeMin: 45000,
    annualFeeMax: 72000,
    facilities: ["Science Labs", "Computer Labs", "Smart Classrooms", "Transport", "Swimming Pool", "Arts & Music", "Canteen"],
    classFees: [
      { id: "dps1", label: "Class 1-5", annualFee: 45000 },
      { id: "dps2", label: "Class 6-8", annualFee: 56000 },
      { id: "dps3", label: "Class 9-10", annualFee: 64000 },
      { id: "dps4", label: "Class 11-12", annualFee: 72000 },
    ],
    studentCount: 3200,
    teacherCount: 160,
    schoolHours: "8:00 AM - 3:00 PM",
    transportAvailable: true,
    transportFee: 11000,
    admissionOpen: true,
    admissionDeadline: "2026-06-15",
    gallery: ["🏫", "🏊", "💻", "🎨", "🚌"],
    contactPhone: "9098765432",
    website: "https://example.com/dps-mathura",
    status: "verified",
    rating: 4.9,
    reviewsCount: 142,
    students: 3200,
    teachers: 160,
    featured: false,
    createdAt: "2026-04-01T11:30:00.000Z",
  },
  {
    id: "school-kv-mathura",
    name: "Kendriya Vidyalaya Mathura",
    tagline: "Affordable and trusted CBSE education",
    about:
      "Kendriya Vidyalaya Mathura delivers consistent board outcomes with affordable fees and a strong foundation for academics and sports.",
    logoUrl: "",
    establishedYear: 1975,
    boards: ["CBSE"],
    schoolType: "Co-Education",
    affiliationNumber: "2109072",
    classesFrom: "Class 1",
    classesTo: "Class 12",
    classesRange: "Class 1 - 12",
    locality: "Vrindavan",
    fullAddress: "Vrindavan Road, Mathura, Uttar Pradesh",
    annualFeeMin: 12000,
    annualFeeMax: 24000,
    facilities: ["Science Labs", "Library", "Sports Ground", "Transport"],
    classFees: [
      { id: "kv1", label: "Class 1-5", annualFee: 12000 },
      { id: "kv2", label: "Class 6-8", annualFee: 16000 },
      { id: "kv3", label: "Class 9-10", annualFee: 19000 },
      { id: "kv4", label: "Class 11-12", annualFee: 24000 },
    ],
    studentCount: 1900,
    teacherCount: 78,
    schoolHours: "7:45 AM - 2:15 PM",
    transportAvailable: true,
    transportFee: 6000,
    admissionOpen: false,
    admissionDeadline: "2026-04-15",
    gallery: ["🏫", "🔬", "🏃", "📚", "🚌"],
    contactPhone: "9345678901",
    website: "https://example.com/kv-mathura",
    status: "verified",
    rating: 4.3,
    reviewsCount: 58,
    students: 1900,
    teachers: 78,
    featured: false,
    createdAt: "2026-04-01T12:15:00.000Z",
  },
];
