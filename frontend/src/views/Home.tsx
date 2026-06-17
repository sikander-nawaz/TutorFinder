import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TutorCard, TutorCardSkeleton } from "@/components/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShieldCheck, GraduationCap, Users, Star, BookOpen, Clock } from "lucide-react";
import { useState, useEffect } from "react";

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data } = await api.get("/stats");
      return data.data || data;
    },
    retry: false,
  });

  const { data: featuredTutors, isLoading: isTutorsLoading } = useQuery({
    queryKey: ["featured-tutors"],
    queryFn: async () => {
      const { data } = await api.get("/tutors/featured");
      return data.data?.tutors || data.tutors || [];
    },
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let query = searchQuery.trim();
    if (activeCity) {
      query += ` ${activeCity}`;
    }
    if (query) {
      router.push(`/tutors?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/tutors");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh] hero-gradient aurora-bg">
        <div className="aurora-mesh" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 depth-orb" aria-hidden="true" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-400/8 depth-orb" style={{ animationDelay: "2s" }} aria-hidden="true" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-blue-400/6 depth-orb-sm" style={{ animationDelay: "4s" }} aria-hidden="true" />

        <div className="container relative z-20 mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-8 border-primary/30 bg-white/50 backdrop-blur-md text-primary px-4 py-1.5 text-sm font-bold rounded-full inline-flex items-center gap-2 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Pakistan's #1 Trusted Tutoring Platform
              </Badge>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground mb-6 md:mb-8 leading-[1.05]">
                Find the Perfect <br />
                <span className="gradient-text">Tutor</span> for Your Child
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-2">
                Connect with highly qualified, background-checked home and online tutors. Start your learning journey with a 2-day free trial.
              </p>

              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-w-3xl mx-auto mb-10 md:mb-12 transform transition-all hover:scale-[1.01] duration-300">
                <div className="flex flex-wrap gap-2 mb-3 px-2">
                  {["Lahore", "Islamabad", "Karachi"].map(city => (
                    <button
                      key={city}
                      onClick={() => setActiveCity(activeCity === city ? null : city)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                        activeCity === city
                          ? "bg-primary text-white"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search subjects, levels..."
                      className="pl-12 h-14 text-lg font-medium border-border/50 rounded-2xl bg-white/50 dark:bg-black/50 focus-visible:ring-primary/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8 rounded-2xl shrink-0 text-lg font-bold shadow-lg shadow-primary/20">
                    Find Tutors
                  </Button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white dark:border-gray-900 bg-muted flex items-center justify-center overflow-hidden shadow-sm relative z-10 hover:z-20 transition-transform hover:scale-110">
                      <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="Parent" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="font-bold text-foreground text-base">Trusted by thousands of parents</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#0b1329] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-glow"
            >
              <div className="bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stats?.totalTutors ? <Counter value={stats.totalTutors} suffix="+" /> : "—"}
              </div>
              <div className="text-white/60 font-semibold">Expert Tutors</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-glow"
            >
              <div className="bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stats?.totalStudents ? <Counter value={stats.totalStudents} suffix="+" /> : "—"}
              </div>
              <div className="text-white/60 font-semibold">Happy Students</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-glow"
            >
              <div className="bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stats?.subjectsOffered ? <Counter value={stats.subjectsOffered} suffix="+" /> : "—"}
              </div>
              <div className="text-white/60 font-semibold">Subjects</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-glow"
            >
              <div className="bg-amber-400/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Star className="h-6 w-6" />
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stats?.avgRating ? (
                  <><Counter value={Math.floor(stats.avgRating * 10)} /><span className="text-2xl">.0</span></>
                ) : "—"}
              </div>
              <div className="text-white/60 font-semibold">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-32 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="h-1.5 w-12 bg-primary rounded-full mb-6"></div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Meet Our <span className="gradient-text">Top Tutors</span>
              </h2>
              <p className="text-muted-foreground text-xl font-medium leading-relaxed">
                Discover highly requested educators who consistently deliver excellent results. All featured tutors are fully background-checked.
              </p>
            </div>
            <Link href="/tutors">
              <Button variant="outline" size="lg" className="shrink-0 font-bold border-2 rounded-xl h-14 px-8">
                View All Tutors
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isTutorsLoading ? (
              Array(3).fill(0).map((_, i) => <TutorCardSkeleton key={i} />)
            ) : !featuredTutors?.length ? (
              <div className="col-span-3 text-center py-16">
                <p className="text-muted-foreground text-lg">No featured tutors yet. Be the first to join!</p>
                <Link href="/register-tutor" className="mt-4 inline-block">
                  <Button>Join as a Tutor</Button>
                </Link>
              </div>
            ) : (
              featuredTutors.slice(0, 3).map((tutor: any, i: number) => (
                <motion.div
                  key={tutor.id || tutor._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <TutorCard tutor={tutor} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/soft-wallpaper.png')] opacity-40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              How <span className="text-primary">TutorFinder</span> Works
            </h2>
            <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
              We make finding the perfect tutor simple, secure, and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 border-t-2 border-dashed border-transparent z-0"></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center relative z-10 bg-background/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-xl shadow-primary/5"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-800/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4">Search & Filter</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Browse our verified tutors by subject, city, level, and rate. Read authentic reviews from other parents.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center relative z-10 bg-background/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-xl shadow-primary/5 transform md:-translate-y-4"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</div>
                <Clock className="h-10 w-10 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4">Request Trial</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Select a tutor and request a 2-day free trial. See if they're the right fit for your child's learning style.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center relative z-10 bg-background/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-xl shadow-primary/5"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</div>
                <GraduationCap className="h-10 w-10 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4">Start Learning</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Continue with regular classes online or at home. Watch your child's confidence and grades improve.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Trial CTA Banner */}
      <section className="py-32 relative overflow-hidden bg-[#0b1329]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full border border-primary/30 rotate-45 pointer-events-none"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border-2 border-amber-500/20 pointer-events-none"></div>
        <div className="absolute top-40 right-40 w-16 h-16 rounded-full bg-primary/20 blur-md pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Limited Time Offer
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 md:mb-8 text-white tracking-tight leading-[1.1]">
              Unlock Your Child's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-primary to-amber-300">Full Potential</span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl text-white/80 mb-10 md:mb-12 font-medium leading-relaxed px-4 md:px-0">
              Every new student gets a 2-day free trial with zero commitment. Let our academic counselors match you with the perfect tutor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tutors">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105">
                  Start Free Trial Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl bg-white/5 backdrop-blur-sm transition-all hover:scale-105">
                  Get Free Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
