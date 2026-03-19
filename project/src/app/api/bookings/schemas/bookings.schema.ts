import { z } from "zod";

export const bookingStatusSchema = z.enum(["NEW", "PENDING", "CONFIRMED", "CANCELLED"]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const paymentStatusSchema = z.enum(["UNPAID", "DEPOSIT", "PAID"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const createBookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(120),
  customerPhone: z.string().min(3, "Phone is required").max(30),
  activityTitle: z.string().min(1, "Activity is required").max(200),
  startAtISO: z.string().datetime(),
  peopleCount: z.coerce.number().int().min(1, "People count must be >= 1"),
  priceMad: z.coerce.number().min(0, "Price must be >= 0"),
  // Optional: let producer add an initial note right away.
  initialNote: z.string().max(2000).optional().nullable(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: bookingStatusSchema,
});
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

export const markDepositSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  depositMad: z.coerce.number().min(0, "Deposit must be >= 0"),
});
export type MarkDepositInput = z.infer<typeof markDepositSchema>;

export const bookingMessageSenderSchema = z.enum(["CUSTOMER", "OPERATOR"]);
export type BookingMessageSender = z.infer<typeof bookingMessageSenderSchema>;

export const sendBookingMessageSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  body: z.string().min(1, "Message is required").max(2000, "Message too long"),
});
export type SendBookingMessageInput = z.infer<typeof sendBookingMessageSchema>;

export type BookingInboxRow = {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;

  customerName: string;
  customerPhone: string;

  activityTitle: string;
  startAt: Date;
  peopleCount: number;
  priceCents: number;

  createdAt: Date;
  updatedAt: Date;
};

export type BookingMessageRow = {
  id: string;
  sender: BookingMessageSender;
  body: string;
  createdAt: Date;
};

export type BookingDetailRow = BookingInboxRow & {
  depositCents: number | null;
  messages: BookingMessageRow[];
};

