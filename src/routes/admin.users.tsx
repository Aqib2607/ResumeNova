import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const USERS = [
  { id: "u_01", name: "Aarav Mehta", email: "aarav@resumenova.app", role: "admin", status: "active", joined: "2025-01-12" },
  { id: "u_02", name: "Priya Shah", email: "priya@acme.io", role: "user", status: "active", joined: "2025-04-19" },
  { id: "u_03", name: "Marcus Turner", email: "marcus@hexcorp.dev", role: "user", status: "active", joined: "2025-09-02" },
  { id: "u_04", name: "Léa Martin", email: "lea@design.fr", role: "user", status: "suspended", joined: "2025-11-30" },
  { id: "u_05", name: "Kenji Watanabe", email: "kenji@tsuki.jp", role: "user", status: "active", joined: "2026-02-08" },
  { id: "u_06", name: "Sofia Romero", email: "sofia@plata.mx", role: "user", status: "invited", joined: "2026-06-19" },
];

function AdminUsers() {
  const [q, setQ] = useState("");
  const filtered = USERS.filter((u) =>
    (u.name + u.email).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <SEO title="Admin · Users" />
      <PageHeader
        title="Users & roles"
        description="Manage every account, assign roles and audit recent activity."
        actions={<Button>Invite user</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="h-9 pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      u.status === "active"
                        ? "bg-success/10 text-success hover:bg-success/15 capitalize"
                        : u.status === "suspended"
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/15 capitalize"
                          : "bg-warning/10 text-warning hover:bg-warning/15 capitalize"
                    }
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>{u.joined}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-4 justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
