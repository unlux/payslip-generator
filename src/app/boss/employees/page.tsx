"use client";

import { useState, useMemo } from "react";
import { useEmployees, useUsers } from "@/hooks/use-db";
import { useStdb } from "@/providers/spacetimedb-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeAccountSchema } from "@/lib/validators";
import { toast } from "sonner";
import type { DbEmployee } from "@/types";

export default function EmployeesPage() {
  const employees = useEmployees();
  const users = useUsers();
  const { conn } = useStdb();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DbEmployee | null>(
    null,
  );

  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    name: "",
    employeeCode: "",
    designation: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    employeeCode: "",
    designation: "",
  });

  const userMap = useMemo(() => {
    const map = new Map<bigint, string>();
    for (const u of users) {
      if (u.employeeId !== undefined) {
        map.set(u.employeeId, u.username);
      }
    }
    return map;
  }, [users]);

  function handleAdd() {
    const result = employeeAccountSchema.safeParse(addForm);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    if (!conn) return;
    try {
      conn.reducers.createEmployeeAccount({
        username: result.data.username,
        password: result.data.password,
        name: result.data.name,
        employeeCode: result.data.employeeCode,
        designation: result.data.designation,
      });
      toast.success("Employee created");
      setAddOpen(false);
      setAddForm({
        username: "",
        password: "",
        name: "",
        employeeCode: "",
        designation: "",
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create employee",
      );
    }
  }

  function openEdit(emp: DbEmployee) {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name,
      employeeCode: emp.employeeCode,
      designation: emp.designation,
    });
    setEditOpen(true);
  }

  function handleEdit() {
    if (!conn || !selectedEmployee) return;
    if (!editForm.name.trim()) {
      toast.error("Employee name is required");
      return;
    }
    try {
      conn.reducers.updateEmployee({
        empId: selectedEmployee.id,
        name: editForm.name,
        employeeCode: editForm.employeeCode,
        designation: editForm.designation,
        customFieldsJson: JSON.stringify([]),
      });
      toast.success("Employee updated");
      setEditOpen(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update employee",
      );
    }
  }

  function handleDelete() {
    if (!conn || !selectedEmployee) return;
    try {
      conn.reducers.deleteEmployee({ empId: selectedEmployee.id });
      toast.success("Employee deleted");
      setDeleteOpen(false);
      setSelectedEmployee(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete employee",
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Employees"
        description="Manage employee accounts"
        action={<Button onClick={() => setAddOpen(true)}>Add Employee</Button>}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No employees yet
              </TableCell>
            </TableRow>
          )}
          {employees.map((emp) => (
            <TableRow key={Number(emp.id)}>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.employeeCode || "-"}</TableCell>
              <TableCell>{emp.designation || "-"}</TableCell>
              <TableCell>{userMap.get(emp.id) ?? "-"}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-username">Username</Label>
              <Input
                id="add-username"
                value={addForm.username}
                onChange={(e) =>
                  setAddForm({ ...addForm, username: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-code">Employee Code</Label>
              <Input
                id="add-code"
                value={addForm.employeeCode}
                onChange={(e) =>
                  setAddForm({ ...addForm, employeeCode: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-designation">Designation</Label>
              <Input
                id="add-designation"
                value={addForm.designation}
                onChange={(e) =>
                  setAddForm({ ...addForm, designation: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">Employee Code</Label>
              <Input
                id="edit-code"
                value={editForm.employeeCode}
                onChange={(e) =>
                  setEditForm({ ...editForm, employeeCode: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({ ...editForm, designation: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {selectedEmployee?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
