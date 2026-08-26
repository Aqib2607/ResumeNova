import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateApplicationMutation, useUpdateApplicationMutation } from "@/hooks/use-jobs";
import { useResumes } from "@/hooks/use-resumes";
import { toast } from "sonner";
import { Loader2, Briefcase } from "lucide-react";
import type { Job, JobApplication } from "@/types";

interface ApplicationTrackerModalProps {
  job: Job | null;
  existingApplication?: JobApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationTrackerModal({
  job,
  existingApplication,
  open,
  onOpenChange,
}: ApplicationTrackerModalProps) {
  const [status, setStatus] = useState<string>(existingApplication?.status || "applied");
  const [appliedAt, setAppliedAt] = useState<string>(
    existingApplication?.applied_at || new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState<string>(existingApplication?.notes || "");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    existingApplication?.resume_id?.toString() || "",
  );

  const { data: resumesData } = useResumes({ per_page: 50 });
  const createMutation = useCreateApplicationMutation();
  const updateMutation = useUpdateApplicationMutation();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const resumes = resumesData?.data || [];

  const handleSave = async () => {
    if (!job) return;

    try {
      if (existingApplication) {
        await updateMutation.mutateAsync({
          id: existingApplication.id,
          payload: {
            status,
            applied_at: appliedAt || null,
            notes,
            resume_id: selectedResumeId ? selectedResumeId : null,
          },
        });
        toast.success("Application status updated!");
      } else {
        await createMutation.mutateAsync({
          job_posting_id: job.id,
          status,
          applied_at: appliedAt || null,
          notes,
          resume_id: selectedResumeId ? selectedResumeId : null,
        });
        toast.success(`Application tracked for ${job.title}!`);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save application details.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Briefcase className="h-5 w-5 text-primary" />
            {existingApplication ? "Update Application Status" : "Track Job Application"}
          </DialogTitle>
          <DialogDescription>
            Record your application progress for <strong>{job?.title}</strong> at{" "}
            <strong>{job?.company || job?.company_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="app-status">Stage / Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="app-status">
                <SelectValue placeholder="Select application status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied (Submitted)</SelectItem>
                <SelectItem value="screening">HR Screening / Initial Review</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offer Received 🎉</SelectItem>
                <SelectItem value="rejected">Not Selected / Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-resume">Resume Used</Label>
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger id="app-resume">
                <SelectValue placeholder="Select resume (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None / External</SelectItem>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-date">Date Applied</Label>
            <Input
              id="app-date"
              name="applied_at"
              type="date"
              aria-label="Date Applied"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-notes">Notes & Key Contacts</Label>
            <Textarea
              id="app-notes"
              name="notes"
              aria-label="Notes and Key Contacts"
              placeholder="e.g., Interviewed with hiring manager Sarah on Zoom. Follow-up next Tuesday."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
