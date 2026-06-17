import {
  BookOpen,
  ShieldCheck,
  Target,
  Users,
  GraduationCap,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const STATS = [
  {
    icon: Users,
    value: "2,500+",
    label: "Verified Tutors",
    color: "text-primary bg-primary/10",
  },
  {
    icon: GraduationCap,
    value: "10,000+",
    label: "Happy Students",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Star,
    value: "4.9 / 5",
    label: "Average Rating",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: TrendingUp,
    value: "3 Cities",
    label: "Across Pakistan",
    color: "text-purple-600 bg-purple-50",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety First",
    description:
      "We rigorously vet every tutor on our platform through identity checks, degree verification, and in-person interviews before they ever connect with a student.",
    color: "bg-primary/10 text-primary",
    border: "border-primary/20",
  },
  {
    icon: Target,
    title: "Quality Education",
    description:
      "We maintain high standards by actively monitoring student feedback and tutor performance to ensure the best learning outcomes for every child.",
    color: "bg-amber-100 text-amber-600",
    border: "border-amber-200",
  },
  {
    icon: BookOpen,
    title: "Accessible Learning",
    description:
      "Whether through home visits in major cities or online classes nationwide, we make finding the right tutor straightforward and transparent.",
    color: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Identity Check",
    body: "Verification of CNIC and official government documents.",
  },
  {
    n: 2,
    title: "Academic Verification",
    body: "Review of university degrees and official transcripts.",
  },
  {
    n: 3,
    title: "Interview",
    body: "One-on-one assessment of communication and teaching skills.",
  },
  {
    n: 4,
    title: "Continuous Monitoring",
    body: "Ongoing review of parent feedback and student progress.",
  },
];

const TEAM = [
  {
    initials: "SN",
    name: "Sikander Nawaz",
    role: "Co-Founder & CEO",
    bg: "bg-primary/10 text-primary",
  },
  {
    initials: "FN",
    name: "Fatima Noor",
    role: "Head of Operations",
    bg: "bg-blue-100 text-blue-700",
  },
  {
    initials: "UM",
    name: "Usman Malik",
    role: "Head of Tutor Quality",
    bg: "bg-amber-100 text-amber-700",
  },
  {
    initials: "SR",
    name: "Sara Rehman",
    role: "Customer Success Lead",
    bg: "bg-purple-100 text-purple-700",
  },
];

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero Header */}
      <section className="bg-secondary text-secondary-foreground py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary mb-6">
            Our Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Empowering Pakistan's
            <br className="hidden sm:block" /> Next Generation
          </h1>
          <p className="text-base md:text-xl text-secondary-foreground/80 leading-relaxed max-w-3xl mx-auto">
            TutorFinder was built on a simple premise: every student deserves
            access to excellent education, and parents deserve peace of mind
            when choosing an educator for their child.
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b border-border/50 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/50">
            {STATS.map(({ icon: Icon, value, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 py-6 md:py-8 px-4 md:px-8 text-center sm:text-left"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">
                    {value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-1 w-10 bg-primary rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">
              What We Stand For
            </h2>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Three principles that guide every decision we make at TutorFinder.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VALUES.map(
              ({ icon: Icon, title, description, color, border }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`rounded-2xl border-2 ${border} bg-background p-6 md:p-8 flex flex-col gap-4 hover:shadow-lg transition-shadow`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Verification Process Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            <div className="flex-1 w-full">
              <div className="h-1 w-10 bg-primary rounded-full mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Our 4-Step Verification Process
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-8">
                We don't just let anyone join TutorFinder. Our rigorous process
                ensures only qualified, trustworthy professionals make it onto
                our platform.
              </p>

              <div className="space-y-5">
                {STEPS.map(({ n, title, body }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-primary/20">
                      {n}
                    </div>
                    <div className="pt-1">
                      <h4 className="text-base font-semibold">{title}</h4>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full max-w-sm mx-auto lg:max-w-none relative">
              <div className="aspect-square bg-primary/5 rounded-full absolute -inset-4 z-0 hidden sm:block" />
              <div className="bg-white border-2 border-primary/10 p-8 rounded-2xl shadow-2xl shadow-primary/10 relative z-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Verified Badge</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Look for the green shield on tutor profiles. It means they've
                  passed our strict security and academic checks.
                </p>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Professional
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-xl font-bold">100%</div>
                    <div className="text-xs text-muted-foreground">
                      CNIC Checked
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-xl font-bold">95%</div>
                    <div className="text-xs text-muted-foreground">
                      Degree Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10 md:mb-14">
            <div className="h-1 w-10 bg-primary rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">
              Meet the Team
            </h2>
            <p className="text-muted-foreground md:text-lg max-w-xl mx-auto">
              A small but passionate team dedicated to transforming education in
              Pakistan.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {TEAM.map(({ initials, name, role, bg }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 md:p-6 rounded-2xl border border-border/50 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold ${bg}`}
                >
                  {initials}
                </div>
                <h4 className="font-bold text-sm md:text-base">{name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="h-1 w-10 bg-primary rounded-full mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start learning?
          </h2>
          <p className="text-muted-foreground md:text-lg mb-8">
            Join thousands of parents who have found the perfect educational
            support for their children through TutorFinder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tutors">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 h-12 md:h-14 text-base font-semibold"
              >
                Find a Tutor
              </Button>
            </Link>
            <Link href="/register-tutor">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-12 md:h-14 text-base font-semibold"
              >
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
