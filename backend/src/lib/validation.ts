import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "Password must be at least 10 characters"),
  name: z.string().min(1).max(120),
  orgName: z.string().min(1).max(120),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createOrgSchema = z.object({
  name: z.string().min(1).max(120),
});
export type CreateOrgInput = z.infer<typeof createOrgSchema>;

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "viewer"]),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const switchOrgSchema = z.object({
  tenantId: z.string().min(1),
});
export type SwitchOrgInput = z.infer<typeof switchOrgSchema>;

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(80),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const eventInputSchema = z.object({
  name: z.string().min(1, "Event name is required").max(120),
  distinctId: z.string().min(1, "distinctId is required").max(120),
  properties: z.record(z.unknown()).optional().default({}),
  occurredAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  idempotencyKey: z.string().max(120).optional(),
});
export type EventInput = z.infer<typeof eventInputSchema>;

export const ingestBatchSchema = z.union([
  eventInputSchema.transform((ev) => [ev]),
  z.array(eventInputSchema).min(1).max(500, "Maximum batch size is 500 events"),
]);
