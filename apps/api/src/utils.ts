import type { ZodType } from 'zod/v4'
import { apiSuccessResponseSchemaFactory } from './schemas'

export const r = <T>(data: T, message?: string) =>
	({
		ok: true,
		message: message ?? 'Success (default)',
		data,
	}) as const

export const apiSuccess = <T extends ZodType>(
	schema: T,
	description?: string,
) => ({
	description: description ?? 'Success',
	content: {
		'application/json': {
			schema: apiSuccessResponseSchemaFactory(schema),
		},
	},
})

export const body = <T extends ZodType>(schema: T) => ({
	required: true,
	content: {
		'application/json': {
			schema,
		},
	},
})
