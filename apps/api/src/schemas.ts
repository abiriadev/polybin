import { z } from '@hono/zod-openapi'

// zod v4 codec
// https://zod.dev/codecs?id=isodatetimetodate
export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: isoString => new Date(isoString),
	encode: date => date.toISOString(),
})
