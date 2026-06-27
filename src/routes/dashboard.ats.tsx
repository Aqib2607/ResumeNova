import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoAtsAnalysis, demoResumes } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/ats")({
  component: AtsAnalyzerPage,
});

function AtsAnalyzerPage() {
  const [resumeId, setResumeId] = useState(demoResumes[0].id);
  const [jd, setJd] = useState(
    "We're hiring a Senior Product Designer with strong design systems experience, deep accessibility (WCAG 2.2) knowledge, GraphQL familiarity, and cross-functional collaboration skills…",
  );
  const a = demoAtsAnalysis;

  return (
    <div>
      <SEO title="ATS Analyzer" />
      <PageHeader
        title="ATS Analyzer"
        description="Score your resume against any job description and learn exactly what to fix."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* INPUT */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="space-y-1.5">
              <Label>Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {demoResumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label>Job description</Label>
              <Textarea rows={12} value={jd} onChange={(e) => setJd(e.target.value)} />
            </div>
            <Button className="mt-4 w-full">
              <Sparkles className="h-4 w-4" /> Analyze
            </Button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ATS Match Score
                </p>
                <p className="mt-1 text-5xl font-semibold tracking-tight">{a.score}</p>
              </div>
              <Badge className="bg-warning/10 text-warning hover:bg-warning/15">Good · improvable</Badge>
            </div>
            <Progress value={a.score} className="mt-5" />
            <div className="mt-6 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface text-center">
              {[
                { l: "Matched", v: a.matched_skills.length, tone: "text-success" },
                { l: "Missing", v: a.missing_skills.length, tone: "text-destructive" },
                { l: "Suggestions", v: a.recommendations.length, tone: "text-primary" },
              ].map((s) => (
                <div key={s.l} className="px-3 py-3">
                  <p className={`text-2xl font-semibold ${s.tone}`}>{s.v}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Keyword breakdown</p>
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>In resume</TableHead>
                  <TableHead>In JD</TableHead>
                  <TableHead className="text-right">JD frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.keywords.map((k) => (
                  <TableRow key={k.keyword}>
                    <TableCell className="font-medium">{k.keyword}</TableCell>
                    <TableCell>
                      {k.in_resume ? (
                        <Badge className="bg-success/10 text-success hover:bg-success/15">Yes</Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/15">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{k.in_jd ? "Yes" : "No"}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{k.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Missing skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.missing_skills.map((s) => (
                  <Badge
                    key={s}
                    className="bg-destructive/10 text-destructive hover:bg-destructive/15"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Matched skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.matched_skills.map((s) => (
                  <Badge key={s} className="bg-success/10 text-success hover:bg-success/15">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Recommendations</p>
            <ul className="mt-3 space-y-2">
              {a.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
