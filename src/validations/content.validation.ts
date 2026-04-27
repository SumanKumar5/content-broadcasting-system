import { z } from "zod";

export const uploadContentSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  duration: z.coerce.number().int().min(1).optional(),
});

export const rejectContentSchema = z.object({
  rejectionReason: z.string().min(1),
});

export type UploadContentInput = z.infer<typeof uploadContentSchema>;
export type RejectContentInput = z.infer<typeof rejectContentSchema>;
