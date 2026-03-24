import { z } from '@hono/zod-openapi'
import type { ZodSchema } from 'zod/v3'

// zod v4 codec
// https://zod.dev/codecs?id=isodatetimetodate
export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: isoString => new Date(isoString),
	encode: date => date.toISOString(),
})

export const apiResponseSchemaFactory = (schema: ZodSchema) =>
	z.union([
		z.object({
			ok: true,
			message: z.string(),
			data: schema,
		}),
		z.object({
			ok: false,
			message: z.string(),
		}),
	])
