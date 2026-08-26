import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Trash2,
  Plus,
  Building,
  GraduationCap,
  FolderGit2,
  Wrench,
  User,
  X,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { ImportsService } from "@/services/endpoints";
import type {
  Resume,
  ResumeTemplate,
  ResumeBasics,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeSkillGroup,
  ResumeImport,
} from "@/types";

export const Route = createFileRoute("/dashboard/resumes/new/upload")({
  component: ResumeUploadWorkflowPage,
});

const templates: { id: ResumeTemplate; name: string; accent: string }[] = [
  { id: "modern-professional", name: "Modern Professional", accent: "bg-primary" },
  { id: "corporate-executive", name: "Corporate Executive", accent: "bg-foreground" },
  { id: "ats-professional", name: "ATS Professional", accent: "bg-success" },
  { id: "creative-professional", name: "Creative Professional", accent: "bg-warning" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

type Step = "select" | "processing" | "review";

export function ResumeUploadWorkflowPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language: currentAppLanguage } = useLanguage();

  const [step, setStep] = useState<Step>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Active Import State
  const [importId, setImportId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Structured Review State
  const [title, setTitle] = useState("Imported Resume");
  const [template, setTemplate] = useState<ResumeTemplate>("modern-professional");
  const [language, setLanguage] = useState<string>(currentAppLanguage || "en");
  const [basics, setBasics] = useState<ResumeBasics>({
    full_name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    summary: "",
  });
  const [experiences, setExperiences] = useState<ResumeExperience[]>([]);
  const [education, setEducation] = useState<ResumeEducation[]>([]);
  const [projects, setProjects] = useState<ResumeProject[]>([]);
  const [skillGroups, setSkillGroups] = useState<ResumeSkillGroup[]>([]);
  const [activeTab, setActiveTab] = useState("basics");

  // Client-Side Validation Helper
  const validateFile = (file: File): boolean => {
    setFileError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(
        t(
          "upload_err_type",
          "Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).",
        ),
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        t("upload_err_size", "File size exceeds 5 MB limit.") +
          ` (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        // Default title to filename without extension
        const rawTitle = file.name.replace(/\.[^/.]+$/, "");
        setTitle(rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        const rawTitle = file.name.replace(/\.[^/.]+$/, "");
        setTitle(rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1));
      }
    }
  };

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return ImportsService.upload(file);
    },
    onSuccess: (data) => {
      const resolvedId =
        data?.import_id ??
        (data as unknown as { id?: number | string })?.id ??
        (data as unknown as { data?: { id?: number | string } })?.data?.id;
      setImportId(resolvedId ? Number(resolvedId) : data.import_id);
      setStep("processing");
      setElapsedSeconds(0);
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message || errorObj?.message || "Failed to upload file.";
      toast.error(msg);
      setFileError(msg);
    },
  });

  const handleStartUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload first.");
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  // Polling Query with TanStack Query
  const { data: importData } = useQuery<ResumeImport>({
    queryKey: ["resume-import", importId],
    queryFn: () => ImportsService.status(importId!),
    enabled: !!importId && step === "processing",
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      // Stop polling when import is ready, failed, or completed
      if (
        currentStatus === "ready" ||
        currentStatus === "failed" ||
        currentStatus === "completed" ||
        currentStatus === "expired"
      ) {
        return false;
      }
      return 2000; // Poll every 2 seconds while pending/processing
    },
  });

  // Timer for processing elapsed seconds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === "processing") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // React to status changes
  useEffect(() => {
    if (!importData || step !== "processing") return;

    if (importData.status === "ready" && importData.parsed_content) {
      const parsed = importData.parsed_content;
      if (parsed.basics) {
        setBasics({
          full_name: parsed.basics.full_name || "",
          headline: parsed.basics.headline || "",
          email: parsed.basics.email || "",
          phone: parsed.basics.phone || "",
          location: parsed.basics.location || "",
          website: parsed.basics.website || "",
          linkedin: parsed.basics.linkedin || "",
          summary: parsed.basics.summary || "",
        });
      }
      if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
        setExperiences(parsed.experiences);
      } else {
        setExperiences([
          {
            id: "exp-1",
            company: "",
            role: "",
            location: "",
            start_date: "",
            end_date: "",
            current: false,
            bullets: [""],
          },
        ]);
      }
      if (Array.isArray(parsed.education) && parsed.education.length > 0) {
        setEducation(parsed.education);
      } else {
        setEducation([
          {
            id: "edu-1",
            school: "",
            degree: "",
            field: "",
            start_date: "",
            end_date: "",
            gpa: "",
          },
        ]);
      }
      if (Array.isArray(parsed.projects)) {
        setProjects(parsed.projects);
      }
      if (Array.isArray(parsed.skill_groups) && parsed.skill_groups.length > 0) {
        setSkillGroups(parsed.skill_groups);
      } else {
        setSkillGroups([
          {
            id: "skill-1",
            category: "Core Skills",
            skills: [],
          },
        ]);
      }

      toast.success("Resume parsed successfully! Review and fine-tune your details below.");
      setStep("review");
    }
  }, [importData, step]);

  // Cancel / Reset Helper
  const handleCancel = async () => {
    if (importId) {
      try {
        await ImportsService.cancel(importId);
      } catch {
        // Ignore cancel errors
      }
    }
    setImportId(null);
    setSelectedFile(null);
    setFileError(null);
    setStep("select");
  };

  // Confirmation Mutation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!importId) throw new Error("No active import session.");

      return ImportsService.confirm(importId, {
        title: title.trim() || "Imported Resume",
        template,
        language,
        basics,
        experiences,
        education,
        projects,
        skill_groups: skillGroups,
      });
    },
    onSuccess: (createdResume: Resume) => {
      toast.success("Resume created! Opening editor...");
      navigate({
        to: "/dashboard/resumes/$id",
        params: { id: String(createdResume.id) },
      });
    },
    onError: (err: unknown) => {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to create resume. Please try again.";
      toast.error(msg);
    },
  });

  // Experience Handlers
  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        company: "",
        role: "",
        location: "",
        start_date: "",
        end_date: "",
        current: false,
        bullets: [""],
      },
    ]);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBullet = (expIdx: number) => {
    setExperiences((prev) =>
      prev.map((exp, i) => (i === expIdx ? { ...exp, bullets: [...exp.bullets, ""] } : exp)),
    );
  };

  const handleUpdateBullet = (expIdx: number, bulletIdx: number, val: string) => {
    setExperiences((prev) =>
      prev.map((exp, i) =>
        i === expIdx
          ? {
              ...exp,
              bullets: exp.bullets.map((b, bi) => (bi === bulletIdx ? val : b)),
            }
          : exp,
      ),
    );
  };

  const handleRemoveBullet = (expIdx: number, bulletIdx: number) => {
    setExperiences((prev) =>
      prev.map((exp, i) =>
        i === expIdx
          ? {
              ...exp,
              bullets: exp.bullets.filter((_, bi) => bi !== bulletIdx),
            }
          : exp,
      ),
    );
  };

  // Education Handlers
  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        school: "",
        degree: "",
        field: "",
        start_date: "",
        end_date: "",
        gpa: "",
      },
    ]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== idx));
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        id: `proj-${Date.now()}`,
        name: "",
        description: "",
        link: "",
        tech: [],
      },
    ]);
  };

  const handleRemoveProject = (idx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
  };

  // Skill Group Handlers
  const handleAddSkillGroup = () => {
    setSkillGroups((prev) => [
      ...prev,
      {
        id: `skill-${Date.now()}`,
        category: "New Skills",
        skills: [],
      },
    ]);
  };

  const handleRemoveSkillGroup = (idx: number) => {
    setSkillGroups((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <SEO title={t("upload_page_title", "Upload & Parse Resume")} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard/resumes/new"
            className="inline-flex items-center text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {t("upload_back_options", "Back to builder options")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("upload_page_title", "Upload & Parse Resume")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "select" &&
              t(
                "upload_page_desc",
                "Import your existing PDF or DOCX resume with AI-powered structure extraction.",
              )}
            {step === "processing" &&
              t(
                "upload_processing_desc",
                "Our Groq-powered AI is extracting structured work history, education, skills, and contact details from your document.",
              )}
            {step === "review" &&
              t(
                "upload_review_desc",
                "Verify the extracted information, make any adjustments, and choose your preferred template before creating your resume.",
              )}
          </p>
        </div>

        {/* Progress Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              step === "select"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {t("upload_step_1", "1. Select Document")}
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              step === "processing"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {t("upload_step_2", "2. AI Processing")}
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              step === "review"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {t("upload_step_3", "3. Review & Customize")}
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 1: UPLOAD DROPZONE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === "select" && (
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive
                ? "border-primary bg-primary/5 shadow-elevated"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <FileUp className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              {selectedFile
                ? selectedFile.name
                : t("upload_dropzone_title", "Upload your resume file")}
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB — ${t("upload_btn_browse", "Click to browse a different file")}`
                : t(
                    "upload_dropzone_subtitle",
                    "Drag and drop your PDF or DOCX file, or click to browse. Max file size: 5 MB.",
                  )}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                PDF
              </Badge>
              <Badge variant="outline" className="text-xs">
                DOCX
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t("upload_supported_formats", "Max 5 MB")}
              </Badge>
            </div>
          </div>

          {fileError && (
            <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {selectedFile && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                    {t("upload_ready_to_analyze", "Ready to analyze:")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="mr-1 h-4 w-4" /> {t("upload_btn_remove", "Remove")}
                </Button>

                <Button
                  onClick={handleStartUpload}
                  disabled={uploadMutation.isPending}
                  className="shadow-sm"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      {t("upload_btn_uploading", "Uploading & Analyzing...")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 text-warning" />{" "}
                      {t("upload_btn_start_import", "Start AI Import")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Prefer manual helper */}
          <div className="pt-2 text-center text-xs text-muted-foreground">
            <span>{t("upload_prefer_manual", "Prefer to start from scratch?")} </span>
            <Link
              to="/dashboard/resumes/new/manual"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t("upload_link_manual", "Try the Manual Builder")}
            </Link>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 2: PROCESSING & POLLING INDICATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === "processing" && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
          <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-primary">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-warning" />
          </div>

          <h2 className="text-xl font-bold">
            {t("upload_processing_title", "Analyzing & Parsing Resume")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "upload_processing_desc",
              "Our Groq-powered AI is extracting structured work history, education, skills, and contact details from your document.",
            )}
          </p>

          {/* Progress Timeline */}
          <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-3 text-xs">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <span className="font-medium text-foreground">
                {t("upload_status_uploading", "Uploading file...")}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <span className="font-medium text-primary">
                {t("upload_status_structuring", "Structuring data with Groq AI...")}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 p-3 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-full border border-border shrink-0" />
              <span>{t("upload_status_validating", "Validating resume schema...")}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>
              {t("upload_time_elapsed", "Time elapsed:")} {elapsedSeconds}s
            </span>
            <span>•</span>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-7">
              {t("upload_btn_discard", "Discard Import")}
            </Button>
          </div>

          {/* Failure Alert */}
          {(importData?.status === "failed" || elapsedSeconds > 75) && (
            <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-left text-sm text-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold">{t("upload_failed_title", "Import Failed")}</p>
                  <p className="text-xs text-destructive/90">
                    {importData?.error_message ||
                      "The parser took longer than expected or encountered a format issue. Scanned image-only PDFs cannot be read automatically."}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />{" "}
                      {t("upload_btn_try_again", "Try Again")}
                    </Button>
                    <Link to="/dashboard/resumes/new/manual">
                      <Button size="sm" variant="default">
                        {t("upload_link_manual", "Try the Manual Builder")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 3: STRUCTURED PREVIEW & EDIT FORM */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-8">
          {/* Top Metadata Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="resume-title" className="text-xs font-semibold">
                  {t("upload_label_resume_title", "Resume Title")}
                </Label>
                <Input
                  id="resume-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5"
                  placeholder="e.g. Senior Software Engineer Resume"
                />
              </div>

              <div>
                <Label htmlFor="resume-template" className="text-xs font-semibold">
                  {t("upload_label_template", "Design Template")}
                </Label>
                <Select
                  value={template}
                  onValueChange={(val) => setTemplate(val as ResumeTemplate)}
                >
                  <SelectTrigger id="resume-template" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((tmpl) => (
                      <SelectItem key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resume-lang" className="text-xs font-semibold">
                  {t("upload_label_language", "Language")}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="resume-lang" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US/UK)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1.5 bg-muted/60">
              <TabsTrigger value="basics" className="flex items-center gap-1.5 py-2 text-xs">
                <User className="h-3.5 w-3.5" /> {t("upload_tab_basics", "Basics & Contact")}
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex items-center gap-1.5 py-2 text-xs">
                <Building className="h-3.5 w-3.5" /> {t("upload_tab_experience", "Experience")} (
                {experiences.length})
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-1.5 py-2 text-xs">
                <GraduationCap className="h-3.5 w-3.5" /> {t("upload_tab_education", "Education")} (
                {education.length})
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-1.5 py-2 text-xs">
                <Wrench className="h-3.5 w-3.5" /> {t("upload_tab_skills", "Skills")} (
                {skillGroups.length})
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1.5 py-2 text-xs">
                <FolderGit2 className="h-3.5 w-3.5" /> {t("upload_tab_projects", "Projects")} (
                {projects.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB: BASICS */}
            <TabsContent
              value="basics"
              className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
            >
              <h3 className="text-base font-semibold">
                {t("upload_tab_basics", "Basics & Contact")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">{t("upload_label_full_name", "Full Name")}</Label>
                  <Input
                    value={basics.full_name}
                    onChange={(e) => setBasics({ ...basics, full_name: e.target.value })}
                    className="mt-1"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    {t("upload_label_headline", "Professional Headline / Target Role")}
                  </Label>
                  <Input
                    value={basics.headline}
                    onChange={(e) => setBasics({ ...basics, headline: e.target.value })}
                    className="mt-1"
                    placeholder="e.g. Senior Full Stack Engineer"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("upload_label_email", "Email Address")}</Label>
                  <Input
                    type="email"
                    value={basics.email}
                    onChange={(e) => setBasics({ ...basics, email: e.target.value })}
                    className="mt-1"
                    placeholder="alex@example.com"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("upload_label_phone", "Phone Number")}</Label>
                  <Input
                    value={basics.phone}
                    onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    {t("upload_label_location", "Location (City, Country)")}
                  </Label>
                  <Input
                    value={basics.location}
                    onChange={(e) => setBasics({ ...basics, location: e.target.value })}
                    className="mt-1"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    {t("upload_label_linkedin", "LinkedIn Profile URL")}
                  </Label>
                  <Input
                    value={basics.linkedin || ""}
                    onChange={(e) => setBasics({ ...basics, linkedin: e.target.value })}
                    className="mt-1"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">
                    {t("upload_label_website", "Personal Website / Portfolio URL")}
                  </Label>
                  <Input
                    value={basics.website || ""}
                    onChange={(e) => setBasics({ ...basics, website: e.target.value })}
                    className="mt-1"
                    placeholder="https://myportfolio.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">
                    {t("upload_label_summary", "Professional Summary")}
                  </Label>
                  <Textarea
                    rows={4}
                    value={basics.summary}
                    onChange={(e) => setBasics({ ...basics, summary: e.target.value })}
                    className="mt-1"
                    placeholder="Briefly describe your career achievements and core domain strengths..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB: EXPERIENCE */}
            <TabsContent value="experience" className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {t("upload_tab_experience", "Experience")} #{idx + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> {t("btn_delete", "Remove")}
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_company", "Company / Organization")}
                      </Label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, company: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="Company"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_position", "Position / Role")}
                      </Label>
                      <Input
                        value={exp.role}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, role: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_exp_location", "Location")}
                      </Label>
                      <Input
                        value={exp.location || ""}
                        onChange={(e) =>
                          setExperiences((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, location: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="City, State / Remote"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">
                          {t("upload_label_start_date", "Start Date")}
                        </Label>
                        <Input
                          value={exp.start_date}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, start_date: e.target.value } : item,
                              ),
                            )
                          }
                          className="mt-1"
                          placeholder="2022-01"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("upload_label_end_date", "End Date")}</Label>
                        <Input
                          value={exp.end_date || ""}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, end_date: e.target.value } : item,
                              ),
                            )
                          }
                          className="mt-1"
                          placeholder="Present"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold">
                      {t("upload_label_exp_desc", "Description / Highlights (one per line)")}
                    </Label>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <Input
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(idx, bIdx, e.target.value)}
                          placeholder="Accomplished [X] measured by [Y] by doing [Z]..."
                          className="text-xs"
                        />
                        {exp.bullets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBullet(idx, bIdx)}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBullet(idx)}
                      className="mt-1 text-xs h-7"
                    >
                      <Plus className="mr-1 h-3 w-3" /> + Add Bullet Point
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddExperience} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" /> {t("upload_btn_add_exp", "Add Experience")}
              </Button>
            </TabsContent>

            {/* TAB: EDUCATION */}
            <TabsContent value="education" className="space-y-4">
              {education.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {t("upload_tab_education", "Education")} #{idx + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> {t("btn_delete", "Remove")}
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_institution", "Institution / School")}
                      </Label>
                      <Input
                        value={edu.school}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, school: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t("upload_label_degree", "Degree")}</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, degree: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="e.g. Bachelor of Science"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_field_of_study", "Field of Study / Major")}
                      </Label>
                      <Input
                        value={edu.field || ""}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, field: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">
                          {t("upload_label_start_date", "Start Date")}
                        </Label>
                        <Input
                          value={edu.start_date}
                          onChange={(e) =>
                            setEducation((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, start_date: e.target.value } : item,
                              ),
                            )
                          }
                          className="mt-1"
                          placeholder="2018"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("upload_label_end_date", "End Date")}</Label>
                        <Input
                          value={edu.end_date || ""}
                          onChange={(e) =>
                            setEducation((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, end_date: e.target.value } : item,
                              ),
                            )
                          }
                          className="mt-1"
                          placeholder="2022"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddEducation} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" /> {t("upload_btn_add_edu", "Add Education")}
              </Button>
            </TabsContent>

            {/* TAB: SKILLS */}
            <TabsContent value="skills" className="space-y-4">
              {skillGroups.map((group, idx) => (
                <div
                  key={group.id || idx}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-1/2">
                      <Label className="text-xs">
                        {t("upload_label_skill_category", "Category (e.g. Frontend, Tools)")}
                      </Label>
                      <Input
                        value={group.category}
                        onChange={(e) =>
                          setSkillGroups((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, category: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="e.g. Technical Skills, Leadership, Tools"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkillGroup(idx)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> {t("btn_delete", "Remove")}
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">
                      {t("upload_label_skills_list", "Skills (comma-separated)")}
                    </Label>
                    <Input
                      value={group.skills.join(", ")}
                      onChange={(e) => {
                        const skillsArray = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setSkillGroups((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, skills: skillsArray } : item,
                          ),
                        );
                      }}
                      className="mt-1"
                      placeholder="React, TypeScript, Node.js, Docker, GraphQL"
                    />
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {group.skills.map((s, si) => (
                        <Badge key={si} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddSkillGroup} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" />{" "}
                {t("upload_btn_add_skill_group", "Add Skill Group")}
              </Button>
            </TabsContent>

            {/* TAB: PROJECTS */}
            <TabsContent value="projects" className="space-y-4">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {t("upload_tab_projects", "Projects")} #{idx + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> {t("btn_delete", "Remove")}
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_project_name", "Project Name")}
                      </Label>
                      <Input
                        value={proj.name}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, name: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="e.g. E-Commerce Microservices Platform"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        {t("upload_label_project_url", "Project URL (optional)")}
                      </Label>
                      <Input
                        value={proj.link || ""}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, link: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">
                        {t("upload_label_project_tech", "Technologies (comma-separated)")}
                      </Label>
                      <Input
                        value={proj.tech ? proj.tech.join(", ") : ""}
                        onChange={(e) => {
                          const techArray = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setProjects((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, tech: techArray } : item,
                            ),
                          );
                        }}
                        className="mt-1"
                        placeholder="React, Golang, PostgreSQL, Redis"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs">
                        {t("upload_label_project_desc", "Description")}
                      </Label>
                      <Textarea
                        rows={3}
                        value={proj.description}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: e.target.value } : item,
                            ),
                          )
                        }
                        className="mt-1"
                        placeholder="Describe the architecture, problem solved, and measurable impact..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddProject} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" /> {t("upload_btn_add_project", "Add Project")}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Bottom Confirmation Bar */}
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-elevated backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>
                {t(
                  "upload_review_desc",
                  "All sections validated • Ready to convert into official ResumeNova document",
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                {t("upload_btn_discard", "Discard Import")}
              </Button>
              <Button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="shadow-sm"
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    {t("upload_btn_creating", "Creating Resume...")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-warning" />{" "}
                    {t("upload_btn_confirm_create", "Confirm & Create Resume")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
