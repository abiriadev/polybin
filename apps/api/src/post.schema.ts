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
