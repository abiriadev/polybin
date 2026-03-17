import { z } from '@hono/zod-openapi'

// zod v4 codec
// https://zod.dev/codecs?id=isodatetimetodate
export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: isoString => new Date(isoString),
	encode: date => date.toISOString(),
})

export const pasteBaseSchema = z.object({
	id: z.string(),
	content: z.string(),
	createdAt: isoDatetimeToDate,
})

export type PasteBase = z.infer<typeof pasteBaseSchema>

export const pasteNewSchema = pasteBaseSchema
	.omit({ id: true, createdAt: true })
	.openapi('PasteNew')

export type PasteNew = z.infer<typeof pasteNewSchema>

export const pasteUpdateSchema = pasteNewSchema.partial().openapi('PasteUpdate')

export type PasteUpdate = z.infer<typeof pasteUpdateSchema>
