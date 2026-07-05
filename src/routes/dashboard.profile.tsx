import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { demoUser } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const initials = demoUser.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div>
      <SEO title="Profile" />
      <PageHeader title="Your profile" description="How you appear across ResumeNova." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="text-base font-semibold">{demoUser.name}</p>
              <p className="text-sm text-muted-foreground">{demoUser.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input defaultValue={demoUser.name} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue={demoUser.email} />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input placeholder="linkedin.com/in/…" />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input placeholder="https://" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Headline</Label>
              <Input placeholder="Senior Product Designer · Design Systems & AI" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bio</Label>
              <Textarea rows={4} placeholder="Tell us about yourself." />
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select defaultValue={demoUser.language}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-semibold">Password</p>
            <p className="mt-1 text-xs text-muted-foreground">Last changed 3 months ago</p>
            <div className="mt-4 space-y-3">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
              <Button className="w-full">Update password</Button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-semibold">Two-factor auth</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add an extra layer of security with an authenticator app.
            </p>
            <Button variant="outline" className="mt-4 w-full">
              Enable 2FA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
