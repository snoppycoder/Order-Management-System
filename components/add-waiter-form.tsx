"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface Waiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  status: "active" | "inactive";
  joinDate: string;
  shift: "morning" | "afternoon" | "evening";
}

interface WaiterFormProps {
  waiter?: Waiter | null;
  onSave: (waiter: Waiter | Omit<Waiter, "id">) => void;
  onClose: () => void;
}

export function WaiterForm({ waiter, onSave, onClose }: WaiterFormProps) {
  const [formData, setFormData] = useState({
    name: waiter?.name || "",
    email: waiter?.email || "",
    phone: waiter?.phone || "",
    employeeId: waiter?.employeeId || "",
    status: waiter?.status || ("active" as const),
    joinDate: waiter?.joinDate || new Date().toISOString().split("T")[0],
    shift: waiter?.shift || ("morning" as const),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.employeeId.trim())
      newErrors.employeeId = "Employee ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (waiter) {
      onSave({
        ...waiter,
        ...formData,
      });
    } else {
      onSave(formData);
    }
  };

  return (
    <Card className="w-full max-w-md border border-border bg-card p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {waiter ? "Edit Waiter" : "Add New Waiter"}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5 " />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter waiter name"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter email address"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Enter phone number"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Shift
          </label>
          <select
            value={formData.shift}
            onChange={(e) =>
              setFormData({
                ...formData,
                shift: e.target.value as "morning" | "afternoon" | "evening",
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div> */}

        {/* Join Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Join Date
          </label>
          <Input
            type="date"
            value={formData.joinDate}
            onChange={(e) =>
              setFormData({ ...formData, joinDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1 px-2 py-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "active" | "inactive",
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer"
          >
            {waiter ? "Update" : "Add"} Waiter
          </Button>
        </div>
      </form>
    </Card>
  );
}
