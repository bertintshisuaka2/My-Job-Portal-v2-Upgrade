import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { FileText, Sparkles, ArrowLeft, Trash2, Eye, Edit, Save } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Documents() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Generation form states
  const [docType, setDocType] = useState<"resume" | "cover-letter" | "recommendation-letter">("resume");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [relationshipInfo, setRelationshipInfo] = useState("");

  const { data: documents, isLoading } = trpc.documents.list.useQuery(
    { documentType: activeTab === "all" ? undefined : activeTab as any },
    { enabled: isAuthenticated }
  );
  const { data: jobs } = trpc.jobs.list.useQuery({ status: "active" });
  const { data: resumes } = trpc.resumes.list.useQuery(undefined, { enabled: isAuthenticated });

  const utils = trpc.useUtils();

  const generateResumeMutation = trpc.ai.generateResume.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Resume generated successfully!");
      resetForm();
      setGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate resume");
    },
  });

  const generateCoverLetterMutation = trpc.ai.generateCoverLetter.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Cover letter generated successfully!");
      resetForm();
      setGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate cover letter");
    },
  });

  const generateRecommendationMutation = trpc.ai.generateRecommendationLetter.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Recommendation letter generated successfully!");
      resetForm();
      setGenerateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate recommendation letter");
    },
  });

  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Document updated successfully!");
      setEditDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update document");
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Document deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  const resetForm = () => {
    setSelectedJobId("");
    setSelectedResumeId("");
    setAdditionalInfo("");
    setRelationshipInfo("");
  };

  const handleGenerate = () => {
    if (docType === "resume") {
      generateResumeMutation.mutate({
        resumeId: selectedResumeId ? parseInt(selectedResumeId) : undefined,
        additionalInfo: additionalInfo || undefined,
      });
    } else if (docType === "cover-letter") {
      if (!selectedJobId) {
        toast.error("Please select a job");
        return;
      }
      generateCoverLetterMutation.mutate({
        jobId: parseInt(selectedJobId),
        resumeId: selectedResumeId ? parseInt(selectedResumeId) : undefined,
        additionalInfo: additionalInfo || undefined,
      });
    } else if (docType === "recommendation-letter") {
      if (!relationshipInfo.trim()) {
        toast.error("Please provide relationship information");
        return;
      }
      generateRecommendationMutation.mutate({
        resumeId: selectedResumeId ? parseInt(selectedResumeId) : undefined,
        jobId: selectedJobId ? parseInt(selectedJobId) : undefined,
        relationshipInfo,
        additionalInfo: additionalInfo || undefined,
      });
    }
  };

  const handleEdit = (doc: any) => {
    setSelectedDocument(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDocument) return;

    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    updateMutation.mutate({
      id: selectedDocument.id,
      title: editTitle,
      content: editContent,
    });
  };

  const isGenerating = 
    generateResumeMutation.isPending || 
    generateCoverLetterMutation.isPending || 
    generateRecommendationMutation.isPending;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access AI document generation</CardDescription>
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI-Generated Documents</h1>
            <p className="text-muted-foreground">
              Create professional resumes, cover letters, and recommendation letters with AI
            </p>
          </div>
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate AI Document</DialogTitle>
                <DialogDescription>
                  Select document type and provide information for AI generation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={(v: any) => setDocType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">Resume</SelectItem>
                      <SelectItem value="cover-letter">Cover Letter</SelectItem>
                      <SelectItem value="recommendation-letter">Recommendation Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {docType === "cover-letter" && (
                  <div className="space-y-2">
                    <Label>Target Job *</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs?.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title} at {job.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {docType === "recommendation-letter" && (
                  <>
                    <div className="space-y-2">
                      <Label>Target Job (Optional)</Label>
                      <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific job</SelectItem>
                          {jobs?.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.title} at {job.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship Information *</Label>
                      <Textarea
                        placeholder="Describe your relationship with the candidate (e.g., 'I was their direct supervisor for 3 years at XYZ Corp...')"
                        value={relationshipInfo}
                        onChange={(e) => setRelationshipInfo(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Base Resume (Optional)</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No resume</SelectItem>
                      {resumes?.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id.toString()}>
                          {resume.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional Information (Optional)</Label>
                  <Textarea
                    placeholder="Add any additional details, achievements, or preferences..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="resume">Resumes</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letters</TabsTrigger>
            <TabsTrigger value="recommendation-letter">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <span className="line-clamp-2">{doc.title}</span>
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(doc.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(doc)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this document?")) {
                              deleteMutation.mutate({ id: doc.id });
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
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first AI-powered document to get started
                  </p>
                  <Button onClick={() => setGenerateDialogOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* View Document Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.title}</DialogTitle>
              <DialogDescription>
                Created on {selectedDocument && new Date(selectedDocument.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none py-4">
              <Streamdown>{selectedDocument?.content || ""}</Streamdown>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>
                Modify the title and content of your document
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Document Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Document Content</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter document content (supports markdown)"
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
