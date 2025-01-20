import * as z from "zod"

export const preJoinSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  enableCamera: z.boolean().default(true),
  enableMicrophone: z.boolean().default(true),
  shareOnSocial: z.boolean().default(false),
})

export type PreJoinFormData = z.infer<typeof preJoinSchema>

