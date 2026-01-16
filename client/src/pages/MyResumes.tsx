import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Upload, FileText, Star, Trash2, Download, ArrowLeft, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function MyResumes() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  const { data: resumes, isLoading } = trpc.resumes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const createResumeMutation = trpc.resumes.create.useMutation({
    onSuccess: () => {
      utils.resumes.list.invalidate();
      if (autoGenerate) {
        toast.success("Resume uploaded! Documents are being generated...");
        utils.documents.list.invalidate();
      } else {
        toast.success("Resume uploaded successfully!");
      }
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload resume");
      setUploading(false);
    },
  });

  const setPrimaryMutation = trpc.resumes.setPrimary.useMutation({
    onSuccess: () => {
      utils.resumes.list.invalidate();
      toast.success("Primary resume updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set primary resume");
    },
  });

  const deleteMutation = trpc.resumes.delete.useMutation({
    onSuccess: () => {
      utils.resumes.list.invalidate();
      toast.success("Resume deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete resume");
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to S3 via server endpoint
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.id.toString() || "");

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await response.json();
      const { fileUrl, fileKey, fileName, fileSize, mimeType } = uploadData;

      // Extract text for AI processing (simplified - in production use proper PDF/DOCX parser)
      let extractedText = "";
      if (file.type === "application/pdf") {
        extractedText = "PDF content extraction requires server-side processing";
      }

      // Save to database with auto-generation flag
      createResumeMutation.mutate({
        fileName,
        fileUrl,
        fileKey,
        fileSize,
        mimeType,
        extractedText: extractedText || undefined,
        autoGenerate: autoGenerate,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage your resumes</CardDescription>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Resumes</h1>
          <p className="text-muted-foreground">
            Upload and manage your resumes. Set one as primary for quick applications.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload a PDF or DOCX file (max 10MB). Your resume will be used for AI-powered document
              generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="autoGenerate" 
                  checked={autoGenerate}
                  onCheckedChange={(checked) => setAutoGenerate(checked as boolean)}
                />
                <Label htmlFor="autoGenerate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Automatically generate documents (resume, cover letter, recommendation letter) from uploaded file
                </Label>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
                {autoGenerate && (
                  <p className="text-sm text-muted-foreground">
                    ⚡ Auto-generation enabled - documents will be created automatically
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumes List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading resumes...</p>
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="relative">
                {resume.isPrimary === 1 && (
                  <Badge className="absolute top-4 right-4" variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span className="break-all">{resume.fileName}</span>
                  </CardTitle>
                  <CardDescription>
                    Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Size: {(resume.fileSize / 1024).toFixed(2)} KB
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                    {resume.isPrimary !== 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryMutation.mutate({ id: resume.id })}
                        disabled={setPrimaryMutation.isPending}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this resume?")) {
                          deleteMutation.mutate({ id: resume.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No resumes uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first resume to get started with applications
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
