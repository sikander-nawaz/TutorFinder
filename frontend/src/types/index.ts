export type Role = "student" | "tutor" | "admin";
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "trial"
  | "completed";
export type TutoringMode = "online" | "home" | "both";
export type TeachingMode = "online" | "home";

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface HomeAddress {
  city: string;
  fullAddress: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  cnic?: string;
  isBlocked: boolean;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  city: string;
  subjects: string[];
  levels: string[];
  level: string;
  experience: number;
  hourlyRate: number;
  bio?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  tutoringType: TutoringMode;
  teachingModes: TeachingMode[];
  availability: { online: AvailabilitySlot[]; home: AvailabilitySlot[] };
  homeTuitionCities: string[];
  online: boolean;
  homeVisit: boolean;
  education?: string;
  qualification?: string;
  isBlocked?: boolean;
  isProfileComplete?: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  classLevel?: string;
  institution?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  verificationStatus: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  tutorId: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  fee: number;
  mode: TutoringMode;
  duration: string;
  availability: { online: AvailabilitySlot[]; home: AvailabilitySlot[] };
  createdAt: string;
}

export interface TutorRequest {
  id: string;
  studentId: string;
  tutorId: string;
  courseId?: string;
  studentName: string;
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  level: string;
  mode: TeachingMode;
  selectedSlot?: AvailabilitySlot;
  meetingLink?: string;
  homeAddress?: HomeAddress;
  message: string;
  status: RequestStatus;
  fee: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  seen: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  studentAvatar?: string;
  tutorAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isTrialMode: boolean;
  requestId: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalRequests: number;
  pendingVerifications: number;
  activeChats: number;
  monthlyRevenue: number;
  revenueData: { month: string; revenue: number }[];
  requestsByStatus: { status: string; count: number }[];
  userGrowth: { month: string; students: number; tutors: number }[];
}

export interface EarningsSummary {
  totalEarned: number;
  thisMonth: number;
  pendingPayouts: number;
  completedSessions: number;
  monthlyData: { month: string; amount: number; sessions: number }[];
}
