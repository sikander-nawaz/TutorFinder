import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0b1329] text-white">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-primary flex items-center justify-center h-10 w-10 rounded-xl shadow-lg shadow-primary/20">
                <span className="text-white font-extrabold text-lg tracking-tight">TF</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Tutor<span className="text-primary">Finder</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
              Pakistan's premier platform for connecting students with highly qualified, verified home and online tutors.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tutors" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/register-tutor" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Top Cities</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tutors?city=Lahore" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Tutors in Lahore
                </Link>
              </li>
              <li>
                <Link href="/tutors?city=Islamabad" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Tutors in Islamabad
                </Link>
              </li>
              <li>
                <Link href="/tutors?city=Karachi" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Tutors in Karachi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Contact Info</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-sm font-medium text-white/70">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>123 Education Avenue, Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-4 text-sm font-medium text-white/70">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-4 text-sm font-medium text-white/70">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>hello@tutorfinder.pk</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-white/50">
            &copy; {new Date().getFullYear()} TutorFinder. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-white/50">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
