import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TutorCard, TutorCardSkeleton } from "@/components/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const CITIES = ["Lahore", "Islamabad", "Karachi"];

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu",
  "Computer Science", "Islamiat", "Pakistan Studies", "History",
  "Geography", "Economics", "Accounting", "Business Studies", "Statistics",
];

export default function Tutors() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "all",
    subject: searchParams.get("subject") || "all",
    level: "all",
    verified: false,
    maxRate: [5000],
  });

  const queryParams: Record<string, any> = {};
  if (filters.search) queryParams.search = filters.search;
  if (filters.city !== "all") queryParams.city = filters.city;
  if (filters.subject !== "all") queryParams.subject = filters.subject;
  if (filters.level !== "all") queryParams.level = filters.level;
  if (filters.verified) queryParams.verified = true;
  if (filters.maxRate[0] < 5000) queryParams.maxRate = filters.maxRate[0];

  const { data: response, isLoading } = useQuery({
    queryKey: ["tutors", queryParams],
    queryFn: async () => {
      const { data } = await api.get("/tutors", { params: queryParams });
      return data.data || data;
    },
    retry: false,
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "all",
      subject: "all",
      level: "all",
      verified: false,
      maxRate: [5000],
    });
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Select value={filters.city} onValueChange={(v) => handleFilterChange("city", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={filters.subject} onValueChange={(v) => handleFilterChange("subject", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={filters.level} onValueChange={(v) => handleFilterChange("level", v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Primary">Primary (1-5)</SelectItem>
              <SelectItem value="Middle">Middle (6-8)</SelectItem>
              <SelectItem value="Matriculation">Matriculation</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="O Levels">O Levels</SelectItem>
              <SelectItem value="A Levels">A Levels</SelectItem>
              <SelectItem value="University">University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label>Max Hourly Rate</Label>
            <span className="text-sm font-medium">Rs. {filters.maxRate[0]}</span>
          </div>
          <Slider
            value={filters.maxRate}
            max={10000}
            step={500}
            onValueChange={(v) => handleFilterChange("maxRate", v)}
          />
        </div>

        <div className="pt-4">
          <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border">
            <Checkbox
              id="verified"
              checked={filters.verified}
              onCheckedChange={(c) => handleFilterChange("verified", c === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="verified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Verified Tutors Only
              </label>
              <p className="text-xs text-muted-foreground">
                Tutors who have passed background checks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tutors = response?.tutors || response?.data || [];
  const total = response?.total || tutors.length;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Find a Tutor</h1>
          <p className="text-muted-foreground">
            Browse our community of expert educators. Use filters to find the perfect match.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, bio, or keywords..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              {filters.search && (
                <button
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => handleFilterChange("search", "")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden shrink-0 flex gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(filters.city !== "all" || filters.subject !== "all" || filters.level !== "all" || filters.verified) && (
                    <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground">!</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filter Tutors</SheetTitle>
                  <SheetDescription>
                    Narrow down your search to find the perfect tutor.
                  </SheetDescription>
                </SheetHeader>
                <FilterPanel />
              </SheetContent>
            </Sheet>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {isLoading ? "Searching..." : `Showing ${total} tutors`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <TutorCardSkeleton key={i} />)}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed mt-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No tutors found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any tutors matching your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tutors.map((tutor: any) => (
                <TutorCard key={tutor.id || tutor._id} tutor={tutor} />
              ))}
            </div>
          )}

          {response && total > tutors.length && (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" size="lg">Load More Tutors</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
