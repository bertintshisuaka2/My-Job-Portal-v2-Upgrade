import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Briefcase, MapPin, DollarSign, Search, FileText, Upload, History, Target, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [statusFilter] = useState("active");
  const [guideOpen, setGuideOpen] = useState(false);

  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({
    search: searchTerm || undefined,
    jobType: jobTypeFilter || undefined,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Branded Header */}
      <header className="border-b border-yellow-400/30 bg-black shadow-sm">
        <div className="container py-8">
          {/* Logo Section - Large with Photo on Left */}
          <div className="flex items-center gap-8 mb-8">
            {/* Profile Photo - Left Side */}
            <div className="flex-shrink-0">
              <img 
                src="/profile-photo.jpg" 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg shadow-yellow-400/50"
              />
            </div>
            
            {/* Enlarged Logo - Takes remaining space */}
            <div className="flex-1">
              <img 
                src="/divalaser-logo.png" 
                alt="Divalaser Software Solution" 
                className="w-full max-w-4xl h-auto object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-yellow-400">Job Portal</h1>
            </Link>
            <nav className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/my-resumes">
                    <Button variant="ghost" size="sm" className="font-medium">
                      <Upload className="h-4 w-4 mr-2" />
                      My Resumes
                    </Button>
                  </Link>
                  <Link href="/my-applications">
                    <Button variant="ghost" size="sm" className="font-medium">
                      <History className="h-4 w-4 mr-2" />
                      Applications
                    </Button>
                  </Link>
                  <Link href="/documents">
                    <Button variant="ghost" size="sm" className="font-medium">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </Link>
                  <Link href="/matched-jobs">
                    <Button variant="ghost" size="sm" className="font-medium">
                      <Target className="h-4 w-4 mr-2" />
                      Job Matching
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="default" size="sm" className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                      {user?.name || "Profile"}
                    </Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="default" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                    Sign In
                  </Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Portal Description & User Guide */}
      <section className="bg-gray-800 border-b border-yellow-400/30">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              Welcome to Divalaser Job Portal
            </h2>
            <p className="text-lg text-yellow-100 leading-relaxed">
              Your intelligent career companion powered by AI. Upload your resume, discover matching opportunities, 
              and generate professional documents instantly. Our platform streamlines your job search with smart 
              matching algorithms, automated document creation, and comprehensive application tracking.
            </p>
          </div>

          {/* User Guide - Collapsible */}
          <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="max-w-4xl mx-auto">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full bg-gray-900 hover:bg-gray-800 border-2 border-yellow-400 text-yellow-400 font-semibold"
              >
                <span className="flex items-center justify-center gap-2">
                  {guideOpen ? "Hide" : "Show"} Step-by-Step User Guide
                  <ChevronDown className={`h-4 w-4 transition-transform ${guideOpen ? "rotate-180" : ""}`} />
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="bg-gray-900 border-2 border-yellow-400/50">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-400">How to Use This Portal</CardTitle>
                  <CardDescription>Follow these simple steps to maximize your job search</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Create Your Account</h3>
                      <p className="text-gray-300">
                        Click "Sign In" in the top right corner to create your account or log in with your existing credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Upload Your Resume</h3>
                      <p className="text-gray-300">
                        Navigate to "My Resumes" and upload your resume (PDF or DOCX). Enable auto-generation to create 
                        formatted documents automatically from your resume content.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Find Matching Jobs</h3>
                      <p className="text-gray-300">
                        Go to "Job Matching" to use AI-powered matching. Select a resume, choose how many jobs you want 
                        to see (3-20), and get personalized recommendations with relevance scores.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Browse & Search Jobs</h3>
                      <p className="text-gray-300">
                        Use the search bar below to find jobs by title, company, location, or Job ID (e.g., JOB-001). 
                        Filter by job type to narrow your results.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Apply to Jobs</h3>
                      <p className="text-gray-300">
                        Click "View Details" on any job card to see full information. Click "Apply Now" to submit your 
                        application. Your application history is automatically tracked.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      6
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Generate Documents</h3>
                      <p className="text-gray-300">
                        Visit "Documents" to create or edit AI-generated resumes, cover letters, and recommendation letters. 
                        Select a resume as the source and customize the content as needed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center">
                      7
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-yellow-300">Track Applications</h3>
                      <p className="text-gray-300">
                        Go to "Applications" to view all your submitted applications, see job details, and monitor your 
                        application status. Keep your job search organized in one place.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">Find Your Dream Job</h2>
          <p className="text-yellow-100">
            Search thousands of job opportunities with AI-powered resume and cover letter generation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-5 w-5" />
            <Input
              placeholder="Search by job title, company, location, or Job ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 border-yellow-400/50 bg-gray-800 text-yellow-100 placeholder:text-gray-400 focus:border-yellow-400"
            />
          </div>
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="w-[200px] h-12 border-2 border-yellow-400/50 bg-gray-800 text-yellow-100 focus:border-yellow-400">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="mt-4 text-yellow-100">Loading jobs...</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="bg-gray-800 hover:shadow-lg hover:shadow-yellow-400/20 transition-shadow border-2 border-yellow-400/30 hover:border-yellow-400">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-yellow-300">{job.title}</CardTitle>
                    <Badge variant="secondary" className="bg-yellow-100 text-black font-semibold">
                      {job.jobId}
                    </Badge>
                  </div>
                  <CardDescription className="text-base font-medium text-yellow-100">
                    {job.company}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm capitalize">{job.jobType?.replace("-", " ")}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{job.salary}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-300 line-clamp-3 mt-3">{job.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/jobs/${job.id}`} className="w-full">
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 text-center py-12 border-2 border-dashed border-yellow-400/30">
            <CardContent>
              <Briefcase className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">No jobs found</h3>
              <p className="text-gray-300">
                {searchTerm || jobTypeFilter
                  ? "Try adjusting your search criteria"
                  : "Check back later for new opportunities"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-400/30 bg-black py-6 mt-auto relative">
        <div className="container text-center text-yellow-100">
          <p className="font-medium">© 2026 Divalaser Software Solution. All rights reserved.</p>
          <p className="text-sm mt-2">Empowering careers with intelligent job matching technology</p>
        </div>
        
        {/* DOC button */}
        <Link href="/documentation">
          <button 
            className="absolute bottom-4 right-8 text-sm text-yellow-500/60 hover:text-yellow-400 hover:opacity-100 transition-all duration-300 px-3 py-1.5 rounded hover:bg-gray-800 border border-yellow-500/20 hover:border-yellow-500/50"
            title="Documentation"
          >
            DOC
          </button>
        </Link>
      </footer>
    </div>
  );
}
