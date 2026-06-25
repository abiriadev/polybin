import z from 'zod'
import { isoDatetimeToDate } from './schemas'

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

export const pasteListSchema = z
	.object({
		items: pasteBaseSchema.array(),
		total: z.number().int(),
		page: z.number().int(),
		pageSize: z.number().int(),
	})
	.openapi('PasteList')

export type PasteList = z.infer<typeof pasteListSchema>

export const pasteListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export type PasteListQuery = z.infer<typeof pasteListQuerySchema>
