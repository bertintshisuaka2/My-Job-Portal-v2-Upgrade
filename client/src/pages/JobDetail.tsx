import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Briefcase, MapPin, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const jobId = parseInt(id || "0");
  const { data: job, isLoading } = trpc.jobs.getById.useQuery({ id: jobId }, { enabled: !!jobId });
  const { data: resumes } = trpc.resumes.list.useQuery(undefined, { enabled: isAuthenticated });

  const utils = trpc.useUtils();
  const applyMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setNotes("");
      setSelectedResumeId("");
      setLocation("/my-applications");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    applyMutation.mutate({
      jobId,
      resumeId: selectedResumeId ? parseInt(selectedResumeId) : undefined,
      notes: notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Job not found</h2>
          <Link href="/">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-xl font-medium text-foreground">
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {job.jobId}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.jobType.replace("-", " ")}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Requirements</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}

                {job.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Benefits</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.benefits}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
                <CardDescription>
                  Submit your application with optional notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resume">Select Resume (Optional)</Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger id="resume">
                          <SelectValue placeholder="Choose a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No resume</SelectItem>
                          {resumes?.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id.toString()}>
                              {resume.fileName}
                              {resume.isPrimary === 1 && " (Primary)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {resumes && resumes.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No resumes uploaded.{" "}
                          <Link href="/my-resumes">
                            <span className="text-primary hover:underline cursor-pointer">
                              Upload one now
                            </span>
                          </Link>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Application Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional information or notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sign in to apply for this position
                    </p>
                    <Button className="w-full" asChild>
                      <a href={getLoginUrl()}>Sign In to Apply</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
