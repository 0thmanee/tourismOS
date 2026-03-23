import { z } from "zod";

export const staffRoleSchema = z.enum(["GUIDE", "DRIVER", "COORDINATOR"]);
export type StaffRole = z.infer<typeof staffRoleSchema>;

export const createStaffMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  role: staffRoleSchema,
  phone: z.string().max(30).optional().nullable(),
});
export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;

export const updateStaffMemberSchema = z.object({
  id: z.string().min(1, "Staff ID is required"),
  name: z.string().min(1).max(120),
  role: staffRoleSchema,
  phone: z.string().max(30).optional().nullable(),
  isActive: z.boolean(),
});
export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;

export const assignStaffSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  staffMemberId: z.string().min(1, "Staff member is required"),
  assignmentRole: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;

export const unassignStaffSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  staffMemberId: z.string().min(1, "Staff member is required"),
});
export type UnassignStaffInput = z.infer<typeof unassignStaffSchema>;

export type StaffMemberRow = {
  id: string;
  organizationId: string;
  name: string;
  role: StaffRole;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BookingAssignmentRow = {
  id: string;
  bookingId: string;
  staffMemberId: string;
  assignmentRole: string | null;
  notes: string | null;
  createdAt: Date;
  staffMember: {
    id: string;
    name: string;
    role: StaffRole;
    phone: string | null;
    isActive: boolean;
  };
};
