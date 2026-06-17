import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const CITIES = ["Lahore", "Islamabad", "Karachi"];

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu",
  "Computer Science", "Islamiat", "Pakistan Studies", "History",
  "Geography", "Economics", "Accounting", "Business Studies", "Statistics",
];

const tutorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  city: z.string().min(1, "Please select a city"),
  level: z.string().min(1, "Please select an education level"),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  hourlyRate: z.coerce.number().min(500, "Minimum rate is Rs. 500/hr"),
  bio: z.string().min(50, "Bio should be at least 50 characters to help students know you"),
  education: z.string().min(5, "Please list your highest qualification"),
  online: z.boolean().default(false),
  homeVisit: z.boolean().default(false),
  availability: z.string().optional()
}).refine(data => data.online || data.homeVisit, {
  message: "You must select at least one teaching method (Online or Home Visit)",
  path: ["online"]
});

type TutorFormValues = z.infer<typeof tutorFormSchema>;

export default function RegisterTutor() {
  const router = useRouter();
  const { toast } = useToast();

  const createTutor = useMutation({
    mutationFn: async (data: TutorFormValues) => {
      const { data: res } = await api.post("/tutors/register", data);
      return res;
    },
  });

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      level: "",
      subjects: [],
      experience: 0,
      hourlyRate: 1000,
      bio: "",
      education: "",
      online: true,
      homeVisit: false,
      availability: "Weekdays evening"
    }
  });

  const onSubmit = (data: TutorFormValues) => {
    createTutor.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Application Submitted!",
          description: "We will review your profile and contact you for verification.",
        });
        router.push("/");
      },
      onError: () => {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleSubjectToggle = (subjectName: string, checked: boolean) => {
    const current = form.getValues("subjects");
    if (checked) {
      form.setValue("subjects", [...current, subjectName], { shouldValidate: true });
    } else {
      form.setValue("subjects", current.filter(s => s !== subjectName), { shouldValidate: true });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Join as a <span className="text-primary">Tutor</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Share your knowledge, set your own schedule, and earn money by helping students succeed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>To ensure quality and safety, all tutors must pass our verification process:</p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Submit your complete profile application</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Document verification (CNIC & Degrees)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Brief online interview assessment</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>Profile gets "Verified" badge and goes live</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Tutor Profile Details</CardTitle>
              <CardDescription>Fill out your information accurately to attract the right students.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Personal Info Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (WhatsApp)</FormLabel>
                            <FormControl><Input placeholder="0300 1234567" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CITIES.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Teaching Details Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Teaching Expertise</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Teaching Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Primary">Primary (1-5)</SelectItem>
                                <SelectItem value="Middle">Middle (6-8)</SelectItem>
                                <SelectItem value="Matriculation">Matriculation</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="O/A Levels">O/A Levels</SelectItem>
                                <SelectItem value="University">University</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Hourly Rate (Rs)</FormLabel>
                              <FormControl><Input type="number" step="100" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Qualification</FormLabel>
                          <FormControl><Input placeholder="e.g. BS Computer Science from LUMS" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subjects"
                      render={() => (
                        <FormItem>
                          <FormLabel>Subjects you teach</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {SUBJECTS.map(subject => (
                              <div key={subject} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`subject-${subject}`}
                                  checked={form.watch("subjects").includes(subject)}
                                  onCheckedChange={(c) => handleSubjectToggle(subject, c === true)}
                                />
                                <label htmlFor={`subject-${subject}`} className="text-sm cursor-pointer">
                                  {subject}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Preferences Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Preferences & Bio</h3>

                    <div className="flex flex-col sm:flex-row gap-6 mb-4">
                      <FormField
                        control={form.control}
                        name="online"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Online Classes</FormLabel>
                              <FormDescription>I can teach remotely via Zoom/Meet</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="homeVisit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Home Visits</FormLabel>
                              <FormDescription>I can travel to student's location</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.formState.errors.online && (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.online.message}</p>
                    )}

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your teaching style, experience, and what makes you a great tutor..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>This will be displayed on your public profile.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg" disabled={createTutor.isPending}>
                    {createTutor.isPending ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
