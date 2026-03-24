import z from 'zod'

export const authRequestSchema = z.object({
	name: z.string(),
	password: z.string(),
})

export type AuthRequest = z.infer<typeof authRequestSchema>

export const authResponseSchema = z.object({
	token: z.string(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>
