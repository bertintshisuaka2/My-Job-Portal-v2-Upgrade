import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Briefcase, MapPin, Calendar, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

function ApplicationCard({ application, onDelete }: { application: any; onDelete: () => void }) {
  const { data: job, isLoading: jobLoading } = trpc.jobs.getById.useQuery(
    { id: application.jobId },
    { enabled: !!application.jobId }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "reviewing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">
                {jobLoading ? "Loading..." : job ? job.title : "Job Not Found"}
              </CardTitle>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <CardDescription className="text-base">
              {jobLoading ? "Loading..." : job ? `${job.company} • ${job.jobId}` : "Unknown"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>
          {job && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="capitalize">{job.jobType.replace("-", " ")}</span>
              </div>
            </>
          )}
        </div>

        {application.notes && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Application Notes</p>
                <p className="text-sm text-muted-foreground">{application.notes}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {job && (
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                View Job
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyApplications() {
  const { isAuthenticated } = useAuth();

  const { data: applications, isLoading } = trpc.applications.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const deleteMutation = trpc.applications.delete.useMutation({
    onSuccess: () => {
      utils.applications.list.invalidate();
      toast.success("Application deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete application");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your applications</CardDescription>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track all your job applications and their status
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onDelete={() => {
                  if (confirm("Are you sure you want to delete this application?")) {
                    deleteMutation.mutate({ id: application.id });
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                Start applying to jobs to track your applications here
              </p>
              <Link href="/">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
