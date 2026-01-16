import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Sparkles, Loader2, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function MatchedJobs() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [matchLimit, setMatchLimit] = useState<string>("5");
  const [matches, setMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const { data: resumes, isLoading: resumesLoading } = trpc.resumes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const findMatchesMutation = trpc.ai.findMatchingJobs.useMutation({
    onSuccess: (data) => {
      setMatches(data.matches);
      setIsMatching(false);
      if (data.matches.length === 0) {
        toast.info("No matching jobs found");
      } else {
        toast.success(`Found ${data.matches.length} matching jobs!`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to find matching jobs");
      setIsMatching(false);
    },
  });

  const handleFindMatches = () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume first");
      return;
    }

    setIsMatching(true);
    setMatches([]);
    findMatchesMutation.mutate({
      resumeId: parseInt(selectedResumeId),
      limit: parseInt(matchLimit),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to find matching jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedResume = resumes?.find(r => r.id === parseInt(selectedResumeId));

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Job Matching</h1>
          <p className="text-muted-foreground">
            Find jobs that perfectly match your resume using AI-powered analysis
          </p>
        </div>

        {/* Resume Selector and Matching Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Find Matching Jobs
            </CardTitle>
            <CardDescription>
              Select your resume and choose how many job matches you want to see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resume-select">Select Resume</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger id="resume-select">
                    <SelectValue placeholder="Choose a resume..." />
                  </SelectTrigger>
                  <SelectContent>
                    {resumesLoading ? (
                      <SelectItem value="loading" disabled>Loading resumes...</SelectItem>
                    ) : resumes && resumes.length > 0 ? (
                      resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id.toString()}>
                          {resume.fileName} {resume.isPrimary === 1 && "⭐"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No resumes uploaded</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedResume && (
                  <p className="text-sm text-muted-foreground">
                    {selectedResume.fileName} ({(selectedResume.fileSize / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="match-limit">Number of Matches</Label>
                <Select value={matchLimit} onValueChange={setMatchLimit}>
                  <SelectTrigger id="match-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Top 3 matches</SelectItem>
                    <SelectItem value="5">Top 5 matches</SelectItem>
                    <SelectItem value="10">Top 10 matches</SelectItem>
                    <SelectItem value="15">Top 15 matches</SelectItem>
                    <SelectItem value="20">Top 20 matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleFindMatches}
              disabled={!selectedResumeId || isMatching}
              size="lg"
              className="w-full"
            >
              {isMatching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Resume & Finding Matches...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Matching Jobs with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Matched Jobs Results */}
        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {matches.length} Matching {matches.length === 1 ? "Job" : "Jobs"} Found
              </h2>
            </div>

            <div className="grid gap-6">
              {matches.map((match, index) => {
                const job = match.job;
                if (!job) return null;

                return (
                  <Card key={job.id} className="relative overflow-hidden">
                    {/* Relevance Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant="default" 
                        className={
                          match.relevanceScore >= 80 
                            ? "bg-green-500" 
                            : match.relevanceScore >= 60 
                            ? "bg-blue-500" 
                            : "bg-yellow-500"
                        }
                      >
                        {match.relevanceScore}% Match
                      </Badge>
                    </div>

                    <CardHeader>
                      <div className="flex items-start gap-3 pr-24">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {job.jobId}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              #{index + 1} Best Match
                            </span>
                          </div>
                          <CardTitle className="text-2xl">{job.title}</CardTitle>
                          <CardDescription className="text-lg">{job.company}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Job Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.jobType}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Why this job matches your resume:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {match.matchReasons.map((reason: string, idx: number) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Job Description Preview */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Job Description:</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => setLocation(`/jobs/${job.id}`)}
                          variant="default"
                        >
                          View Full Details
                        </Button>
                        <Button
                          onClick={() => setLocation(`/jobs/${job.id}`)}
                          variant="outline"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Resumes State */}
        {resumes && resumes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No resumes uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your resume first to find matching jobs
              </p>
              <Link href="/my-resumes">
                <Button>Upload Resume</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
