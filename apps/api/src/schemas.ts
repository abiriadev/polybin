import { z } from '@hono/zod-openapi'
import type { ZodSchema } from 'zod/v3'
import type { ZodType } from 'zod/v4'

// zod v4 codec
// https://zod.dev/codecs?id=isodatetimetodate
export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: isoString => new Date(isoString),
	encode: date => date.toISOString(),
})

export const apiSuccessResponseSchemaFactory = <
	T extends ZodType,
	M extends string,
>(
	schema: T,
	message?: M,
) =>
	z.object({
		ok: true,
		message: message ? z.literal(message) : z.string(),
		data: schema,
	})

export const apiFailureResponseSchemaFactory = <T extends string>(
	message?: T,
) =>
	z.object({
		ok: false,
		message: message ? z.literal(message) : z.string(),
	})

export const idSchema = z.string().openapi({
	param: {
		name: 'id',
		in: 'path',
	},
})
