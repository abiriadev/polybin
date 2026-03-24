import z from 'zod'
import { isoDatetimeToDate } from './schemas'

export const userBaseSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: isoDatetimeToDate,
})

export type UserBase = z.infer<typeof userBaseSchema>

export const userNewSchem = userBaseSchema
	.omit({ id: true, createdAt: true })
	.extend({
		password: z.string(),
	})
	.openapi('UserNew')

export type UserNew = z.infer<typeof userNewSchem>

export type UserNewWithHash = Omit<UserNew, 'password'> & { hash: string }
