/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          TutorFinder — Demo Data Seed Script                ║
 * ║  Creates: Users, Tutors, Students, Requests, Reviews,       ║
 * ║           Courses — perfect for demo / portfolio showcase   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * USAGE:
 *   node seed.mjs
 *   # OR with URI directly:
 *   MONGODB_URI=mongodb+srv://... node seed.mjs
 *
 * Place this file inside:  TutorFinder/backend/
 * Then run from that folder.
 *
 * All demo accounts use password:  Demo@1234
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tutorfinder";
const DEMO_PASSWORD = "Demo@1234";
const SALT_ROUNDS = 10;

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, Math.min(n, arr.length));
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function randDate(maxMonthsAgo, minMonthsAgo = 0) {
  const now = Date.now();
  const minMs = minMonthsAgo * 30 * 24 * 60 * 60 * 1000;
  const maxMs = maxMonthsAgo * 30 * 24 * 60 * 60 * 1000;
  return new Date(now - randInt(minMs, maxMs));
}

// ─── REFERENCE DATA ──────────────────────────────────────────────────────────
const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Faisalabad",
  "Rawalpindi", "Multan", "Peshawar", "Gujranwala",
  "Sialkot", "Bahawalpur", "Sargodha", "Quetta",
  "Hyderabad", "Abbottabad", "Mardan",
];

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Urdu", "Computer Science", "Statistics",
  "Economics", "Accounting", "History", "Geography",
  "Pak Studies", "Islamic Studies", "General Science",
  "Further Mathematics", "Business Studies",
];

const LEVELS = [
  "Primary", "Middle", "Matric", "Intermediate",
  "O-Level", "A-Level", "Undergraduate", "Entry Test Prep",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const QUALIFICATIONS = [
  "BS Mathematics", "MS Physics", "BS Computer Science",
  "BS Chemistry", "M.Phil Mathematics", "BS Biology",
  "MBA", "BS English Literature", "MS Chemistry",
  "BS Economics", "M.Phil Physics", "BS Statistics",
  "MS Computer Science", "BS Accounting", "MA Urdu",
  "MS Mathematics", "BS Civil Engineering", "MS Economics",
];

const INSTITUTIONS = [
  "University of Lahore", "Punjab University", "FAST NUCES",
  "LUMS", "COMSATS University", "UET Lahore",
  "GCU Lahore", "Bahria University", "Quaid-i-Azam University",
  "University of Karachi", "IBA Karachi", "NED University",
  "University of Peshawar", "BZU Multan", "University of Agriculture Faisalabad",
];

const CLASS_LEVELS = [
  "Grade 5", "Grade 6", "Grade 7", "Grade 8",
  "Grade 9 (Matric)", "Grade 10 (Matric)",
  "Grade 11 (FSc Part-1)", "Grade 12 (FSc Part-2)",
  "O-Level Year 1", "O-Level Year 2",
  "A-Level Year 1", "A-Level Year 2",
  "Undergraduate Year 1", "Undergraduate Year 2",
  "Entry Test Preparation",
];

const BIOS = [
  "Experienced teacher with 5+ years in academics. I specialise in making complex topics easy to understand through real-world examples.",
  "Passionate educator committed to student success. I use modern teaching methods to engage students and build confidence.",
  "Masters degree holder with experience in both school and college level teaching. Very friendly, patient, and result-oriented.",
  "I believe every student can excel with the right guidance. My goal is to build strong fundamentals that last a lifetime.",
  "Former school teacher now offering private tuition. Proven track record of improving student grades by 20–40%.",
  "Dedicated tutor with expertise in multiple subjects. I tailor my teaching style to match each student's learning pace.",
  "5 years of teaching experience at academy level. I focus on conceptual understanding rather than rote learning.",
  "Gold medalist from university with a passion for teaching. Specialise in exam preparation and conceptual clarity.",
  "I have tutored more than 200 students over 8 years. My students consistently score A and A+ in board exams.",
  "Certified teacher with hands-on experience in both O/A Levels and Pakistani board curricula.",
  "I use visual aids, past papers, and regular mock tests to keep students exam-ready throughout the year.",
  "Friendly and approachable tutor. I make sure every student feels comfortable asking questions without hesitation.",
  "Highly qualified with an M.Phil degree. I bring academic rigour combined with easy-to-follow teaching methods.",
  "I have 7 years of home tutoring experience in Lahore. Available on weekends for intensive revision sessions.",
  "Online tutor specialising in STEM subjects. My sessions are structured, interactive, and result-oriented.",
  "Former university lecturer now offering personalised tutoring. I know exactly where students struggle and how to fix it.",
];

const REVIEW_COMMENTS = [
  "Bahut acha padhata hai, mera beta ka result dramatically improve hua!",
  "Excellent teacher, very patient and knowledgeable. Highly recommended.",
  "Meri beti Mathematics mein A+ lai. Shukriya itni mehnat ke liye!",
  "Very professional and always punctual. My child looks forward to every session.",
  "Best tutor I have found for Physics. Explains even the hardest concepts clearly.",
  "Affordable rates, great quality teaching, and genuinely cares about students.",
  "Always comes on time and explains concepts in a very engaging way.",
  "My child improved from 60% to 85% in just 3 months of tutoring. Amazing!",
  "Great overall experience. Would definitely hire again next semester.",
  "Very dedicated and passionate about teaching. 10/10 would recommend.",
  "My son finally understands calculus thanks to this tutor. Life-changing!",
  "Structured lessons, regular feedback, and very responsive. Top-notch.",
  "Pehlay mujhe lagta tha Physics impossible hai, lekin ab mujhe mazaa aata hai!",
  "Homework assignments were very helpful. Teacher explains every mistake patiently.",
  "Beti ka confidence level kaafi badh gaya hai. Shukriya!",
  "One of the best decisions we made for our son's education. Results speak for themselves.",
  "Online sessions were smooth, well-organised, and very productive.",
  "Sir ne entry test ke liye itni achi preparation karwayi ke main NUST mein select ho gaya!",
  "Bahut zyada mehnat karte hain students ke saath. Har topic ko detail mein samjhate hain.",
  "Chemistry waqi mein ab easy lagti hai. Tutor ne formulas ko bahut creative way mein sikhaya.",
  "Highly professional. Sends notes and practice questions after every session.",
  "My daughter went from failing to topping her class in 4 months. Incredible!",
  "Great personality, makes learning fun. Kids actually enjoy studying now.",
  "Mujhe statistics se darr lagta tha, ab main confidently exam deta hoon.",
  "Very thorough and detail-oriented. Explains every concept from multiple angles.",
];

const REQUEST_MESSAGES = [
  "Mujhe Mathematics mein help chahiye, especially calculus aur algebra.",
  "My child is struggling with Physics numericals. Need urgent help.",
  "Looking for a patient tutor for O-Level Chemistry preparation.",
  "Need help with English essay writing and grammar for Matric.",
  "Preparing for A-Level exams, need expert guidance for the next 3 months.",
  "Mera beta Grade 9 mein hai, use Math aur Science dono mein tuition chahiye.",
  "Looking for an online tutor for Computer Science — Python and databases.",
  "Need a home tutor for FSc Biology, preferably female tutor.",
  "Seeking guidance for Economics and Accounting for Intermediate.",
  "My daughter needs help with Urdu language and literature.",
  "Entry test preparation for MDCAT. Need Biology and Chemistry expert.",
  "ECAT preparation required, especially Physics and Mathematics.",
  "My son is in O-Level and struggling with Further Mathematics badly.",
  "Looking for weekend-only classes for Grade 10 Science subjects.",
  "Need online tutor for A-Level Economics. Past papers practice required.",
  "Apne bachy ko Statistics sikhwana chahta hoon Intermediate ke liye.",
  "Need an experienced tutor for FSc Part 2 Chemistry. Board exams in 4 months.",
  "Looking for a tutor who can teach both Math and Computer Science.",
  "My daughter needs Urdu and Pak Studies help for Matric board exams.",
  "Seeking a qualified tutor for Grade 8 General Science and Maths.",
];

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["student", "tutor", "admin"] },
    phone: String,
    city: String,
    cnic: String,
    avatarUrl: String,
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    refreshTokens: { type: Array, default: [] },
  },
  { timestamps: true }
);

const AvailabilitySlotSchema = new mongoose.Schema(
  { day: String, startTime: String, endTime: String },
  { _id: false }
);

const TutorDocSchema = new mongoose.Schema(
  {
    docType: { type: String, enum: ["cnic_front", "cnic_back", "degree", "experience_letter"] },
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TutorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    bio: String,
    subjects: [String],
    levels: [String],
    tutoringType: { type: String, enum: ["online", "home", "both"], default: "online" },
    teachingModes: { type: [String], enum: ["online", "home"], default: ["online"] },
    availability: {
      online: { type: [AvailabilitySlotSchema], default: [] },
      home: { type: [AvailabilitySlotSchema], default: [] },
    },
    homeTuitionCities: [String],
    hourlyRate: Number,
    experience: Number,
    qualification: String,
    documents: { type: [TutorDocSchema], default: [] },
    verificationStatus: {
      type: String,
      enum: ["unverified", "documents_submitted", "interview_scheduled", "approved", "rejected", "reapplication"],
      default: "unverified",
    },
    verificationNotes: String,
    rejectedAt: Date,
    interviewLink: String,
    interviewDate: Date,
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const StudentDocSchema = new mongoose.Schema(
  {
    docType: { type: String, enum: ["cnic_front", "cnic_back", "domicile", "student_card"] },
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    classLevel: String,
    institution: String,
    documents: { type: [StudentDocSchema], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending_review", "approved", "rejected", "reapplication"],
      default: "unverified",
    },
    verificationNotes: String,
    rejectedAt: Date,
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TutorRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName: String,
    tutorName: String,
    tutorAvatarUrl: String,
    subject: String,
    level: String,
    mode: { type: String, enum: ["online", "home"] },
    selectedSlot: { day: String, startTime: String, endTime: String },
    meetingLink: String,
    homeAddress: { city: String, fullAddress: String },
    message: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "trial", "completed"],
      default: "pending",
    },
    fee: Number,
    scheduledAt: Date,
    trialStartedAt: Date,
    trialExpiresAt: Date,
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TutorRequest", unique: true },
    studentName: String,
    studentAvatar: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

const CourseSlotSchema = new mongoose.Schema(
  { day: String, startTime: String, endTime: String },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    subject: String,
    level: String,
    description: String,
    fee: Number,
    mode: { type: String, enum: ["online", "home", "both"] },
    duration: String,
    availability: {
      online: { type: [CourseSlotSchema], default: [] },
      home: { type: [CourseSlotSchema], default: [] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── MODELS ──────────────────────────────────────────────────────────────────
const User = mongoose.model("User", UserSchema);
const TutorProfile = mongoose.model("TutorProfile", TutorProfileSchema);
const StudentProfile = mongoose.model("StudentProfile", StudentProfileSchema);
const TutorRequest = mongoose.model("TutorRequest", TutorRequestSchema);
const Review = mongoose.model("Review", ReviewSchema);
const Course = mongoose.model("Course", CourseSchema);

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const TUTOR_SEED = [
  // Approved tutors (indices 0–169)
  { name: "Ahmad Raza",            email: "ahmad.raza@demo.com"            },
  { name: "Fatima Khan",           email: "fatima.khan@demo.com"           },
  { name: "Muhammad Usman",        email: "m.usman@demo.com"               },
  { name: "Ayesha Siddiqui",       email: "ayesha.sid@demo.com"            },
  { name: "Hassan Ali",            email: "hassan.ali@demo.com"            },
  { name: "Zainab Malik",          email: "zainab.malik@demo.com"          },
  { name: "Bilal Ahmed",           email: "bilal.ahmed@demo.com"           },
  { name: "Sana Iqbal",            email: "sana.iqbal@demo.com"            },
  { name: "Omar Farooq",           email: "omar.farooq@demo.com"           },
  { name: "Hina Baig",             email: "hina.baig@demo.com"             },
  { name: "Kamran Sheikh",         email: "kamran.sheikh@demo.com"         },
  { name: "Nadia Hussain",         email: "nadia.hussain@demo.com"         },
  { name: "Tariq Mehmood",         email: "tariq.mehmood@demo.com"         },
  { name: "Rabia Qureshi",         email: "rabia.qureshi@demo.com"         },
  { name: "Imran Butt",            email: "imran.butt@demo.com"            },
  { name: "Saira Naz",             email: "saira.naz@demo.com"             },
  { name: "Adnan Mirza",           email: "adnan.mirza@demo.com"           },
  { name: "Amna Riaz",             email: "amna.riaz@demo.com"             },
  { name: "Kashif Sultan",         email: "kashif.sultan@demo.com"         },
  { name: "Maria Jabeen",          email: "maria.jabeen@demo.com"          },
  { name: "Waseem Akhtar",         email: "waseem.akhtar@demo.com"         },
  { name: "Saba Tariq",            email: "saba.tariq@demo.com"            },
  { name: "Naveed Alam",           email: "naveed.alam@demo.com"           },
  { name: "Farzana Khatoon",       email: "farzana.khatoon@demo.com"       },
  { name: "Shoaib Rashid",         email: "shoaib.rashid@demo.com"         },
  { name: "Lubna Hamid",           email: "lubna.hamid@demo.com"           },
  { name: "Zubair Chaudhry",       email: "zubair.chaudhry@demo.com"       },
  { name: "Tahira Parveen",        email: "tahira.parveen@demo.com"        },
  { name: "Faizan Gondal",         email: "faizan.gondal@demo.com"         },
  { name: "Rukhsana Bibi",         email: "rukhsana.bibi@demo.com"         },
  { name: "Asim Javed",            email: "asim.javed@demo.com"            },
  { name: "Ghazala Nisar",         email: "ghazala.nisar@demo.com"         },
  { name: "Rizwan Haider",         email: "rizwan.haider@demo.com"         },
  { name: "Mehwish Saeed",         email: "mehwish.saeed@demo.com"         },
  { name: "Talal Chaudhry",        email: "talal.chaudhry@demo.com"        },
  { name: "Samina Bashir",         email: "samina.bashir@demo.com"         },
  { name: "Khurram Shehzad",       email: "khurram.shehzad@demo.com"       },
  { name: "Zubaida Parveen",       email: "zubaida.parveen@demo.com"       },
  { name: "Waqar Azeem",           email: "waqar.azeem@demo.com"           },
  { name: "Naila Rafiq",           email: "naila.rafiq@demo.com"           },
  { name: "Saleem Ansari",         email: "saleem.ansari@demo.com"         },
  { name: "Uzma Yaqoob",           email: "uzma.yaqoob@demo.com"           },
  { name: "Shahid Rauf",           email: "shahid.rauf@demo.com"           },
  { name: "Bushra Aslam",          email: "bushra.aslam@demo.com"          },
  { name: "Aamir Nawaz",           email: "aamir.nawaz@demo.com"           },
  { name: "Rehana Shafiq",         email: "rehana.shafiq@demo.com"         },
  { name: "Jawad Iqbal",           email: "jawad.iqbal@demo.com"           },
  { name: "Shazia Begum",          email: "shazia.begum@demo.com"          },
  { name: "Nadeem Anwar",          email: "nadeem.anwar@demo.com"          },
  { name: "Fouzia Naseem",         email: "fouzia.naseem@demo.com"         },
  { name: "Umer Hayat",            email: "umer.hayat@demo.com"            },
  { name: "Shamim Akhtar",         email: "shamim.akhtar@demo.com"         },
  { name: "Asif Mehmood",          email: "asif.mehmood@demo.com"          },
  { name: "Misbah Rani",           email: "misbah.rani@demo.com"           },
  { name: "Pervaiz Akhtar",        email: "pervaiz.akhtar@demo.com"        },
  { name: "Sajida Kiran",          email: "sajida.kiran@demo.com"          },
  { name: "Irfan Habib",           email: "irfan.habib@demo.com"           },
  { name: "Nasreen Bano",          email: "nasreen.bano@demo.com"          },
  { name: "Farhan Zafar",          email: "farhan.zafar@demo.com"          },
  { name: "Humera Shaheen",        email: "humera.shaheen@demo.com"        },
  { name: "Zahid Hussain",         email: "zahid.hussain@demo.com"         },
  { name: "Tabassum Bibi",         email: "tabassum.bibi@demo.com"         },
  { name: "Aslam Gujjar",          email: "aslam.gujjar@demo.com"          },
  { name: "Yasmeen Fatima",        email: "yasmeen.fatima@demo.com"        },
  { name: "Rashid Latif",          email: "rashid.latif@demo.com"          },
  { name: "Rukhsar Naz",           email: "rukhsar.naz@demo.com"           },
  { name: "Akbar Ali",             email: "akbar.ali@demo.com"             },
  { name: "Farah Deeba",           email: "farah.deeba@demo.com"           },
  { name: "Muneeb ur Rahman",      email: "muneeb.rahman@demo.com"         },
  { name: "Savera Shahid",         email: "savera.shahid@demo.com"         },
  { name: "Tauseef Ahmad",         email: "tauseef.ahmad@demo.com"         },
  { name: "Mahvish Noor",          email: "mahvish.noor@demo.com"          },
  { name: "Salman Khurshid",       email: "salman.khurshid@demo.com"       },
  { name: "Abida Parveen",         email: "abida.parveen.t@demo.com"       },
  { name: "Qaiser Mehmood",        email: "qaiser.mehmood@demo.com"        },
  { name: "Zara Amin",             email: "zara.amin@demo.com"             },
  { name: "Nauman Bashir",         email: "nauman.bashir@demo.com"         },
  { name: "Madiha Tariq",          email: "madiha.tariq@demo.com"          },
  { name: "Khalid Pervaiz",        email: "khalid.pervaiz@demo.com"        },
  { name: "Sumaira Gul",           email: "sumaira.gul@demo.com"           },
  { name: "Adeel Akram",           email: "adeel.akram@demo.com"           },
  { name: "Nusrat Ara",            email: "nusrat.ara@demo.com"            },
  { name: "Hafiz Bilal",           email: "hafiz.bilal@demo.com"           },
  { name: "Sadaf Mehmood",         email: "sadaf.mehmood@demo.com"         },
  { name: "Sohail Rana",           email: "sohail.rana@demo.com"           },
  { name: "Kausar Sultana",        email: "kausar.sultana@demo.com"        },
  { name: "Imtiaz Ahmad",          email: "imtiaz.ahmad.t@demo.com"        },
  { name: "Huma Shaukat",          email: "huma.shaukat@demo.com"          },
  { name: "Javed Akhtar",          email: "javed.akhtar.t@demo.com"        },
  { name: "Shagufta Naz",          email: "shagufta.naz@demo.com"          },
  { name: "Arif Waqas",            email: "arif.waqas@demo.com"            },
  { name: "Robina Mukhtar",        email: "robina.mukhtar@demo.com"        },
  { name: "Zeeshan Qadir",         email: "zeeshan.qadir@demo.com"         },
  { name: "Parveen Akhtar",        email: "parveen.akhtar@demo.com"        },
  { name: "Sajjad Hussain",        email: "sajjad.hussain@demo.com"        },
  { name: "Tahira Bibi",           email: "tahira.bibi@demo.com"           },
  { name: "Shafiq ur Rahman",      email: "shafiq.rahman@demo.com"         },
  { name: "Raheela Nisar",         email: "raheela.nisar@demo.com"         },
  { name: "Iftikhar Baig",         email: "iftikhar.baig@demo.com"         },
  { name: "Nazia Perveen",         email: "nazia.perveen@demo.com"         },
  { name: "Mujahid Ali",           email: "mujahid.ali@demo.com"           },
  { name: "Suraya Batool",         email: "suraya.batool@demo.com"         },
  { name: "Haroon Rasheed",        email: "haroon.rasheed@demo.com"        },
  { name: "Shahnaz Begum",         email: "shahnaz.begum@demo.com"         },
  { name: "Fawad Chaudhry",        email: "fawad.chaudhry.t@demo.com"      },
  { name: "Mehreen Zahid",         email: "mehreen.zahid@demo.com"         },
  { name: "Aqeel Ahmad",           email: "aqeel.ahmad@demo.com"           },
  { name: "Tasneem Sultana",       email: "tasneem.sultana@demo.com"       },
  { name: "Babar Azam",            email: "babar.azam.t@demo.com"          },
  { name: "Rubina Kosar",          email: "rubina.kosar@demo.com"          },
  { name: "Mansoor Ahmed",         email: "mansoor.ahmed@demo.com"         },
  { name: "Ambreen Fatima",        email: "ambreen.fatima@demo.com"        },
  { name: "Tanveer Gill",          email: "tanveer.gill@demo.com"          },
  { name: "Nosheen Malik",         email: "nosheen.malik@demo.com"         },
  { name: "Ejaz Ahmad",            email: "ejaz.ahmad@demo.com"            },
  { name: "Gulnaz Bibi",           email: "gulnaz.bibi@demo.com"           },
  { name: "Sabir Hussain",         email: "sabir.hussain@demo.com"         },
  { name: "Farida Hafeez",         email: "farida.hafeez@demo.com"         },
  { name: "Mohsin Raza",           email: "mohsin.raza@demo.com"           },
  { name: "Zahida Perveen",        email: "zahida.perveen@demo.com"        },
  { name: "Ghulam Mustafa",        email: "ghulam.mustafa@demo.com"        },
  { name: "Shahida Kausar",        email: "shahida.kausar@demo.com"        },
  { name: "Rao Zahid",             email: "rao.zahid@demo.com"             },
  { name: "Iram Shehzadi",         email: "iram.shehzadi@demo.com"         },
  { name: "Tariq Jamil",           email: "tariq.jamil.t@demo.com"         },
  { name: "Mehnaz Akhtar",         email: "mehnaz.akhtar@demo.com"         },
  { name: "Zulfiqar Ali",          email: "zulfiqar.ali@demo.com"          },
  { name: "Fehmida Yasmin",        email: "fehmida.yasmin@demo.com"        },
  { name: "Asghar Shah",           email: "asghar.shah@demo.com"           },
  { name: "Surriya Batool",        email: "surriya.batool@demo.com"        },
  { name: "Liaqat Ali",            email: "liaqat.ali@demo.com"            },
  { name: "Samreen Jabeen",        email: "samreen.jabeen@demo.com"        },
  { name: "Noman Ilyas",           email: "noman.ilyas@demo.com"           },
  { name: "Shazia Kanwal",         email: "shazia.kanwal@demo.com"         },
  { name: "Riaz Ahmed",            email: "riaz.ahmed@demo.com"            },
  { name: "Aisha Bibi",            email: "aisha.bibi.t@demo.com"          },
  { name: "Waqas Malik",           email: "waqas.malik.t@demo.com"         },
  { name: "Nasim Akhtar",          email: "nasim.akhtar@demo.com"          },
  { name: "Hamid Nawaz",           email: "hamid.nawaz@demo.com"           },
  { name: "Rafia Khanam",          email: "rafia.khanam@demo.com"          },
  { name: "Danish Anwar",          email: "danish.anwar.t@demo.com"        },
  { name: "Sabiha Rashid",         email: "sabiha.rashid@demo.com"         },
  { name: "Maqsood Ahmad",         email: "maqsood.ahmad@demo.com"         },
  { name: "Naghmana Parveen",      email: "naghmana.parveen@demo.com"      },
  { name: "Fida Hussain",          email: "fida.hussain@demo.com"          },
  { name: "Zobia Khalid",          email: "zobia.khalid@demo.com"          },
  { name: "Ansar Mehmood",         email: "ansar.mehmood@demo.com"         },
  { name: "Mariam Aziz",           email: "mariam.aziz@demo.com"           },
  { name: "Shabbir Ahmad",         email: "shabbir.ahmad@demo.com"         },
  { name: "Faiza Noor",            email: "faiza.noor@demo.com"            },
  { name: "Rana Imran",            email: "rana.imran@demo.com"            },
  { name: "Saadia Bibi",           email: "saadia.bibi@demo.com"           },
  { name: "Mushtaq Ahmad",         email: "mushtaq.ahmad@demo.com"         },
  { name: "Kalsoom Bibi",          email: "kalsoom.bibi@demo.com"          },
  { name: "Tehsin Ullah",          email: "tehsin.ullah@demo.com"          },
  { name: "Shehla Naz",            email: "shehla.naz@demo.com"            },
  { name: "Altaf Hussain",         email: "altaf.hussain.t@demo.com"       },
  { name: "Naheed Akhtar",         email: "naheed.akhtar@demo.com"         },
  { name: "Taimoor Khan",          email: "taimoor.khan@demo.com"          },
  { name: "Nilufar Rashid",        email: "nilufar.rashid@demo.com"        },
  { name: "Saad Rafique",          email: "saad.rafique@demo.com"          },
  { name: "Ruqaiya Bibi",          email: "ruqaiya.bibi@demo.com"          },
  { name: "Ahmer Siddiqui",        email: "ahmer.siddiqui@demo.com"        },
  { name: "Shumaila Rafiq",        email: "shumaila.rafiq@demo.com"        },
  { name: "Junaid Akbar",          email: "junaid.akbar@demo.com"          },
  { name: "Nafeesa Bibi",          email: "nafeesa.bibi@demo.com"          },
  { name: "Fahad Bashir",          email: "fahad.bashir@demo.com"          },
  { name: "Lubna Bibi",            email: "lubna.bibi@demo.com"            },
  // Non-approved tutors (indices 170–179)
  { name: "Usman Ghani",           email: "usman.ghani@demo.com"           }, // documents_submitted
  { name: "Kiran Shahzadi",        email: "kiran.shahzadi@demo.com"        }, // documents_submitted
  { name: "Naveed Zafar",          email: "naveed.zafar@demo.com"          }, // documents_submitted
  { name: "Amreen Asif",           email: "amreen.asif@demo.com"           }, // documents_submitted
  { name: "Salman Faridi",         email: "salman.faridi@demo.com"         }, // interview_scheduled
  { name: "Qurat ul Ain",          email: "quratulain@demo.com"            }, // interview_scheduled
  { name: "Kashif Nawaz",          email: "kashif.nawaz.t@demo.com"        }, // interview_scheduled
  { name: "Junaid Pervaiz",        email: "junaid.pervaiz@demo.com"        }, // rejected
  { name: "Shaista Wahab",         email: "shaista.wahab@demo.com"         }, // rejected
  { name: "Bilal Saeed",           email: "bilal.saeed.t@demo.com"         }, // rejected
];

const STUDENT_SEED = [
  { name: "Ali Hassan",          email: "ali.hassan.s@demo.com"        },
  { name: "Sara Ahmed",          email: "sara.ahmed.s@demo.com"        },
  { name: "Umar Qasim",          email: "umar.qasim@demo.com"          },
  { name: "Maryam Zia",          email: "maryam.zia@demo.com"          },
  { name: "Hamza Tariq",         email: "hamza.tariq@demo.com"         },
  { name: "Amna Yousaf",         email: "amna.yousaf@demo.com"         },
  { name: "Zaid Rehman",         email: "zaid.rehman@demo.com"         },
  { name: "Iqra Naeem",          email: "iqra.naeem@demo.com"          },
  { name: "Asad Nisar",          email: "asad.nisar@demo.com"          },
  { name: "Saima Waheed",        email: "saima.waheed@demo.com"        },
  { name: "Faisal Jamil",        email: "faisal.jamil@demo.com"        },
  { name: "Noor Fatima",         email: "noor.fatima@demo.com"         },
  { name: "Waqas Anwar",         email: "waqas.anwar@demo.com"         },
  { name: "Hira Shahid",         email: "hira.shahid@demo.com"         },
  { name: "Danish Raza",         email: "danish.raza@demo.com"         },
  { name: "Mahnoor Aslam",       email: "mahnoor.aslam@demo.com"       },
  { name: "Talha Mehmood",       email: "talha.mehmood@demo.com"       },
  { name: "Sobia Khan",          email: "sobia.khan.s@demo.com"        },
  { name: "Ahsan Riaz",          email: "ahsan.riaz@demo.com"          },
  { name: "Fareeha Siddiq",      email: "fareeha.siddiq@demo.com"      },
  { name: "Nabeel Asghar",       email: "nabeel.asghar@demo.com"       },
  { name: "Areeba Zafar",        email: "areeba.zafar@demo.com"        },
  { name: "Kamil Shah",          email: "kamil.shah@demo.com"          },
  { name: "Rida Fatima",         email: "rida.fatima@demo.com"         },
  { name: "Shahzaib Rauf",       email: "shahzaib.rauf@demo.com"       },
  { name: "Nimra Aslam",         email: "nimra.aslam@demo.com"         },
  { name: "Bilal Zubair",        email: "bilal.zubair.s@demo.com"      },
  { name: "Ayra Noor",           email: "ayra.noor@demo.com"           },
  { name: "Hassaan Baig",        email: "hassaan.baig@demo.com"        },
  { name: "Sumbal Raza",         email: "sumbal.raza@demo.com"         },
  { name: "Ehtisham Aziz",       email: "ehtisham.aziz@demo.com"       },
  { name: "Javeria Malik",       email: "javeria.malik@demo.com"       },
  { name: "Usama Ijaz",          email: "usama.ijaz@demo.com"          },
  { name: "Misha Chaudhry",      email: "misha.chaudhry@demo.com"      },
  { name: "Awais Cheema",        email: "awais.cheema@demo.com"        },
  { name: "Laiba Shoaib",        email: "laiba.shoaib@demo.com"        },
  { name: "Zohaib Ikram",        email: "zohaib.ikram@demo.com"        },
  { name: "Ramsha Pervaiz",      email: "ramsha.pervaiz@demo.com"      },
  // Pending/unverified students (indices 38–39)
  { name: "Imtiaz Kazmi",        email: "imtiaz.kazmi@demo.com"        }, // pending_review
  { name: "Komal Tauseef",       email: "komal.tauseef@demo.com"       }, // unverified
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fakeDocs(docTypes) {
  return docTypes.map((docType, i) => ({
    docType,
    url: `https://res.cloudinary.com/demo/image/upload/v1/tutorfinder/docs/${docType}_${i}.jpg`,
    publicId: `tutorfinder/docs/${docType}_${i}`,
    uploadedAt: new Date(),
  }));
}

function makeSlots(count = 3) {
  const days = pickN(DAYS, count);
  return days.map((day) => {
    const startHour = randInt(8, 18);
    return {
      day,
      startTime: `${String(startHour).padStart(2, "0")}:00`,
      endTime: `${String(startHour + 2).padStart(2, "0")}:00`,
    };
  });
}

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  TutorFinder Seed Script Starting...");
  console.log(`📡  Connecting to: ${MONGO_URI.replace(/:[^:@]+@/, ":****@")}\n`);

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("✅  MongoDB connected.\n");

  // ── 1. CLEAR OLD DEMO DATA ──────────────────────────────────────────────
  console.log("🗑️   Clearing old demo data...");
  const demoEmails = [
    ...TUTOR_SEED.map((t) => t.email),
    ...STUDENT_SEED.map((s) => s.email),
    "admin@tutorfinder.pk",
  ];
  const oldUsers = await User.find({ email: { $in: demoEmails } }).select("_id");
  const oldIds = oldUsers.map((u) => u._id);

  await Promise.all([
    User.deleteMany({ email: { $in: demoEmails } }),
    TutorProfile.deleteMany({ userId: { $in: oldIds } }),
    StudentProfile.deleteMany({ userId: { $in: oldIds } }),
    TutorRequest.deleteMany({ $or: [{ studentId: { $in: oldIds } }, { tutorId: { $in: oldIds } }] }),
    Review.deleteMany({ $or: [{ studentId: { $in: oldIds } }, { tutorId: { $in: oldIds } }] }),
    Course.deleteMany({ tutorId: { $in: oldIds } }),
  ]);
  console.log("✅  Old demo data cleared.\n");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  // ── 2. CREATE ADMIN ──────────────────────────────────────────────────────
  console.log("👤  Creating admin user...");
  const admin = await User.create({
    name: "Admin TutorFinder",
    email: "admin@tutorfinder.pk",
    passwordHash,
    role: "admin",
    phone: "+923001234567",
    city: "Lahore",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
  });
  console.log(`   ✅ Admin: ${admin.email}`);

  // ── 3. CREATE TUTORS ─────────────────────────────────────────────────────
  console.log("\n👨‍🏫  Creating tutors...");
  const tutorUsers = [];
  const tutorProfiles = [];

  for (let i = 0; i < TUTOR_SEED.length; i++) {
    const { name, email } = TUTOR_SEED[i];

    // Indices 0–169 → approved, 170–173 → documents_submitted, 174–176 → interview_scheduled, 177–179 → rejected
    let verificationStatus = "approved";
    if (i >= 170 && i <= 173) verificationStatus = "documents_submitted";
    else if (i >= 174 && i <= 176) verificationStatus = "interview_scheduled";
    else if (i >= 177) verificationStatus = "rejected";

    const subjects = pickN(SUBJECTS, randInt(2, 5));
    const levels   = pickN(LEVELS, randInt(2, 4));
    const city     = CITIES[i % CITIES.length];
    const rate     = randInt(4, 35) * 100; // 400–3500 PKR
    const exp      = randInt(1, 12);
    const tutoringType = pick(["online", "home", "both"]);
    const avgRating = verificationStatus === "approved"
      ? parseFloat((Math.random() * 1.5 + 3.5).toFixed(1))
      : 0;
    const totalReviews = verificationStatus === "approved" ? randInt(3, 30) : 0;

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "tutor",
      phone: `+9230${randInt(10000000, 99999999)}`,
      city,
      cnic: `${randInt(10000, 99999)}-${randInt(1000000, 9999999)}-${randInt(1, 9)}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      isEmailVerified: true,
      isPhoneVerified: verificationStatus === "approved",
      isActive: true,
      createdAt: randDate(12, 1),
    });

    const docs = fakeDocs(["cnic_front", "cnic_back", "degree"]);
    if (exp > 2) docs.push(...fakeDocs(["experience_letter"]));

    const profile = await TutorProfile.create({
      userId: user._id,
      bio: pick(BIOS),
      subjects,
      levels,
      tutoringType,
      teachingModes: tutoringType === "both"
        ? ["online", "home"]
        : tutoringType === "online"
        ? ["online"]
        : ["home"],
      availability: {
        online: tutoringType !== "home" ? makeSlots(randInt(3, 5)) : [],
        home:   tutoringType !== "online" ? makeSlots(randInt(2, 4)) : [],
      },
      homeTuitionCities: tutoringType !== "online" ? pickN(CITIES, randInt(2, 4)) : [],
      hourlyRate: rate,
      experience: exp,
      qualification: pick(QUALIFICATIONS),
      documents: docs,
      verificationStatus,
      verificationNotes:
        verificationStatus === "rejected"
          ? "Documents were unclear. Please resubmit with better quality images."
          : verificationStatus === "interview_scheduled"
          ? "Scheduled for verification interview on the provided link."
          : undefined,
      interviewLink:
        verificationStatus === "interview_scheduled"
          ? "https://meet.google.com/demo-link"
          : undefined,
      interviewDate:
        verificationStatus === "interview_scheduled"
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          : undefined,
      averageRating: avgRating,
      totalReviews,
      isProfileComplete: verificationStatus !== "rejected" && verificationStatus !== "unverified",
    });

    tutorUsers.push(user);
    tutorProfiles.push(profile);
    process.stdout.write(`   ✅ ${name} (${verificationStatus})\n`);
  }

  // ── 4. CREATE STUDENTS ───────────────────────────────────────────────────
  console.log("\n🎓  Creating students...");
  const studentUsers = [];

  for (let i = 0; i < STUDENT_SEED.length; i++) {
    const { name, email } = STUDENT_SEED[i];

    let verificationStatus = "approved";
    if (i === 38) verificationStatus = "pending_review";
    else if (i === 39) verificationStatus = "unverified";

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "student",
      phone: `+9233${randInt(10000000, 99999999)}`,
      city: CITIES[i % CITIES.length],
      cnic: `${randInt(10000, 99999)}-${randInt(1000000, 9999999)}-${randInt(1, 9)}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&style=circle`,
      isEmailVerified: true,
      isPhoneVerified: verificationStatus === "approved",
      isActive: true,
      createdAt: randDate(10, 0),
    });

    const docs = fakeDocs(["cnic_front", "cnic_back", "student_card"]);

    await StudentProfile.create({
      userId: user._id,
      classLevel: pick(CLASS_LEVELS),
      institution: pick(INSTITUTIONS),
      documents: verificationStatus !== "unverified" ? docs : [],
      isEmailVerified: true,
      isPhoneVerified: verificationStatus === "approved",
      verificationStatus,
      isProfileComplete: verificationStatus === "approved",
    });

    studentUsers.push(user);
    process.stdout.write(`   ✅ ${name} (${verificationStatus})\n`);
  }

  // ── 5. CREATE COURSES ────────────────────────────────────────────────────
  console.log("\n📚  Creating courses...");
  const COURSE_TEMPLATES = [
    { titleFn: (s, l) => `${s} Complete Course — ${l}`,       desc: "Comprehensive course covering all topics from basics to advanced level. Weekly tests and past paper practice included." },
    { titleFn: (s)    => `${s} Crash Course`,                  desc: "Intensive crash course ideal for exam preparation. Focus on high-yield topics, formulae sheets, and past paper drill." },
    { titleFn: (s, l) => `${s} Fundamentals (${l})`,           desc: "Build a strong foundation. Perfect for students who want to clear their basics before attempting advanced material." },
    { titleFn: (s, l) => `${s} — Board Exam Prep (${l})`,      desc: "Targeted exam preparation with model papers, chapter-wise notes, and timed practice sessions." },
    { titleFn: (s)    => `${s} Mastery Programme`,             desc: "Deep-dive programme designed for students aiming for top marks. Includes weekly assessments and detailed feedback." },
    { titleFn: (s, l) => `${s} for ${l} Students`,             desc: "Tailored specifically for this grade level. Covers entire syllabus with extra focus on commonly examined topics." },
  ];

  const allCourses = [];
  const approvedTutors = tutorUsers.filter((_, i) => i <= 169);

  for (const tutor of approvedTutors) {
    const profile = tutorProfiles[tutorUsers.indexOf(tutor)];
    const numCourses = randInt(2, 4);
    const tutorSubjects = profile.subjects.slice(0, numCourses);

    for (const subject of tutorSubjects) {
      const level  = pick(profile.levels);
      const tmpl   = pick(COURSE_TEMPLATES);
      const mode   = profile.tutoringType;
      const fee    = profile.hourlyRate * randInt(8, 20);

      const course = await Course.create({
        tutorId: tutor._id,
        title: tmpl.titleFn(subject, level),
        subject,
        level,
        description: tmpl.desc,
        fee,
        mode,
        duration: pick(["1 hour / day", "1.5 hours / day", "2 hours / day", "45 min / day"]),
        availability: {
          online: mode !== "home" ? makeSlots(randInt(3, 5)) : [],
          home:   mode !== "online" ? makeSlots(randInt(2, 3)) : [],
        },
        isActive: Math.random() > 0.1, // 90% active
      });
      allCourses.push(course);
    }
  }
  console.log(`   ✅ ${allCourses.length} courses created.`);

  // ── 6. CREATE TUTOR REQUESTS ─────────────────────────────────────────────
  console.log("\n📩  Creating tutor requests...");

  /**
   * Status distribution — 240 total requests over 12 months:
   *   completed  → 120  (rich history for charts)
   *   approved   → 45
   *   trial      → 30
   *   pending    → 30
   *   rejected   → 15
   */
  const REQUEST_PLAN = [
    ...Array(120).fill("completed"),
    ...Array(45).fill("approved"),
    ...Array(30).fill("trial"),
    ...Array(30).fill("pending"),
    ...Array(15).fill("rejected"),
  ];

  const allRequests = [];
  const approvedStudents = studentUsers.filter((_, i) => i <= 37);

  for (let i = 0; i < REQUEST_PLAN.length; i++) {
    const status   = REQUEST_PLAN[i];
    const tutor    = approvedTutors[i % approvedTutors.length];
    const student  = approvedStudents[i % approvedStudents.length];
    const profile  = tutorProfiles[tutorUsers.indexOf(tutor)];
    const subject  = pick(profile.subjects);
    const level    = pick(profile.levels);

    const mode = profile.tutoringType === "both"
      ? pick(["online", "home"])
      : profile.tutoringType;

    const fee      = profile.hourlyRate;
    const slotPool = [
      ...profile.availability.online,
      ...profile.availability.home,
    ];
    const slot = slotPool.length ? pick(slotPool) : null;

    // Spread evenly across the last 12 months
    const monthAgo  = Math.floor((i / REQUEST_PLAN.length) * 12);
    const createdAt = randDate(monthAgo + 1, monthAgo);

    const trialStarted =
      status === "trial" || status === "completed"
        ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        : undefined;
    const trialExpires = trialStarted
      ? new Date(trialStarted.getTime() + 3 * 24 * 60 * 60 * 1000)
      : undefined;

    const request = await TutorRequest.create({
      studentId: student._id,
      tutorId: tutor._id,
      studentName: student.name,
      tutorName: tutor.name,
      tutorAvatarUrl: tutor.avatarUrl,
      subject,
      level,
      mode,
      selectedSlot: slot || undefined,
      meetingLink: mode === "online" ? "https://meet.google.com/demo-session" : undefined,
      homeAddress:
        mode === "home"
          ? { city: student.city, fullAddress: `${randInt(1, 999)} Demo Street, ${student.city}` }
          : undefined,
      message: pick(REQUEST_MESSAGES),
      status,
      fee,
      scheduledAt:
        status !== "pending"
          ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
          : undefined,
      trialStartedAt: trialStarted,
      trialExpiresAt: trialExpires,
      createdAt,
      updatedAt: createdAt,
    });

    allRequests.push(request);
  }
  console.log(`   ✅ ${allRequests.length} tutor requests created.`);

  // ── 7. CREATE REVIEWS ────────────────────────────────────────────────────
  console.log("\n⭐  Creating reviews...");
  const completedRequests = allRequests.filter((r) => r.status === "completed");
  const reviewsCreated = [];

  for (const req of completedRequests) {
    const tutor   = tutorUsers.find((u) => u._id.equals(req.tutorId));
    const student = studentUsers.find((u) => u._id.equals(req.studentId));
    if (!tutor || !student) continue;

    // Bias toward higher ratings (realistic distribution)
    const ratingPool = [3, 4, 4, 4, 5, 5, 5, 5];
    const rating = pick(ratingPool);

    const review = await Review.create({
      tutorId: tutor._id,
      studentId: student._id,
      requestId: req._id,
      studentName: student.name,
      studentAvatar: student.avatarUrl,
      rating,
      comment: pick(REVIEW_COMMENTS),
      createdAt: new Date(req.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
    });
    reviewsCreated.push(review);
  }

  // Recalculate and update tutor average ratings from actual reviews
  for (const tutorUser of approvedTutors) {
    const tutorReviews = reviewsCreated.filter((r) => r.tutorId.equals(tutorUser._id));
    if (tutorReviews.length === 0) continue;
    const avg = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
    await TutorProfile.updateOne(
      { userId: tutorUser._id },
      { averageRating: parseFloat(avg.toFixed(1)), totalReviews: tutorReviews.length }
    );
  }
  console.log(`   ✅ ${reviewsCreated.length} reviews created.`);

  // ── 8. PRINT SUMMARY ─────────────────────────────────────────────────────
  const totalRevenue = allRequests
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.fee * 0.1, 0);

  const approvedTutorCount    = TUTOR_SEED.length - 10;
  const pendingTutorCount     = 4;
  const interviewTutorCount   = 3;
  const rejectedTutorCount    = 3;
  const approvedStudentCount  = STUDENT_SEED.length - 2;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║               ✅  SEED COMPLETED SUCCESSFULLY               ║
╠══════════════════════════════════════════════════════════════╣
║  👑 Admin          : 1                                       ║
║  👨‍🏫 Tutors         : ${TUTOR_SEED.length} total                                  ║
║     ✔ Approved     : ${approvedTutorCount}                                     ║
║     📄 Docs subm.  : ${pendingTutorCount}                                      ║
║     🗓 Interview    : ${interviewTutorCount}                                      ║
║     ✖ Rejected     : ${rejectedTutorCount}                                      ║
║  🎓 Students       : ${STUDENT_SEED.length} total (${approvedStudentCount} approved, 2 pending)    ║
║  📚 Courses        : ${allCourses.length}                                      ║
║  📩 Requests       : ${allRequests.length}                                     ║
║     ✅ Completed   : 120                                     ║
║     🟢 Approved    : 45                                      ║
║     🔵 Trial       : 30                                      ║
║     🟡 Pending     : 30                                      ║
║     🔴 Rejected    : 15                                      ║
║  ⭐ Reviews        : ${reviewsCreated.length}                                     ║
║  💰 Platform Rev.  : ~PKR ${Math.round(totalRevenue).toLocaleString()} (10% commission)   ║
╠══════════════════════════════════════════════════════════════╣
║  🔑 All passwords  : Demo@1234                              ║
║  👑 Admin login    : admin@tutorfinder.pk / Demo@1234       ║
║  👨‍🏫 Tutor login    : ahmad.raza@demo.com / Demo@1234        ║
║  🎓 Student login  : ali.hassan.s@demo.com / Demo@1234      ║
╚══════════════════════════════════════════════════════════════╝
`);

  await mongoose.disconnect();
  process.exit(0);
}

// ─── RUN ─────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
