import { createFileRoute } from "@tanstack/react-router";
import { Loader2, MoreHorizontal, Search, Shield, UserCheck, UserX } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminUsers,
  useAdminAssignRole,
  useAdminSuspendUser,
  useAdminReactivateUser,
} from "@/hooks/use-admin";
import type { User } from "@/types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Manage Role Dialog State
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const { data: usersData, isLoading } = useAdminUsers({
    q: q || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
  });

  const assignRoleMutation = useAdminAssignRole();
  const suspendMutation = useAdminSuspendUser();
  const reactivateMutation = useAdminReactivateUser();

  const users: User[] = useMemo(() => {
    return Array.isArray(usersData)
      ? usersData
      : usersData?.data && Array.isArray(usersData.data)
        ? usersData.data
        : [];
  }, [usersData]);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await assignRoleMutation.mutateAsync({ id: selectedUser.id, role: newRole });
      toast.success(`Role updated for ${selectedUser.name}.`);
      setRoleDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role.";
      toast.error(message);
    }
  };

  const handleToggleSuspend = async (user: User) => {
    try {
      if (user.status === "suspended") {
        await reactivateMutation.mutateAsync(user.id);
        toast.success(`User ${user.name} reactivated.`);
      } else {
        await suspendMutation.mutateAsync({ id: user.id, reason: "Administrative suspension" });
        toast.success(`User ${user.name} suspended.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change user status.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Admin · Users & Roles" />
      <PageHeader
        title="Users & Roles"
        description="Manage accounts, assign RBAC permissions, and review account standing."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="h-9 pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading users directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">No users found matching your filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === "super_admin"
                          ? "default"
                          : u.role === "admin"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize font-mono text-[10px]"
                    >
                      {u.role ? u.role.replace("_", " ") : "user"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.status === "active"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-500 text-[10px]"
                      }
                    >
                      {u.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role || "user");
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleSuspend(u)}
                          className={
                            u.status === "suspended"
                              ? "text-emerald-600 focus:text-emerald-600"
                              : "text-destructive focus:text-destructive"
                          }
                        >
                          {u.status === "suspended" ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" /> Reactivate User
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" /> Suspend User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Role Change Modal */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update RBAC permission tier for <strong>{selectedUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User (Standard Access)</SelectItem>
                <SelectItem value="admin">Administrator (Management Access)</SelectItem>
                <SelectItem value="super_admin">
                  Super Administrator (Full System Authority)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={assignRoleMutation.isPending}>
              {assignRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Role Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
