import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
	pasteBaseSchema,
	type PasteNew,
	pasteNewSchema,
	pasteUpdateSchema,
} from './schemas'
import type { InjectedEnv } from './env'

const idSchema = z.string().openapi({
	param: {
		name: 'id',
		in: 'path',
	},
})

export const app = new OpenAPIHono<InjectedEnv>()

const listPastesRoute = createRoute({
	method: 'get',
	path: '/',
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: pasteBaseSchema.array(),
				},
			},
		},
	},
})

app.openapi(listPastesRoute, async c => {
	const result = await c.get('db').listPastes()

	return c.json(result, 200)
})

const createPasteRoute = createRoute({
	method: 'post',
	path: '/',
	request: {
		body: {
			required: true,
			content: {
				'application/json': {
					schema: pasteNewSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: pasteBaseSchema,
				},
			},
		},
	},
})

app.openapi(createPasteRoute, async c => {
	const body: PasteNew = c.req.valid('json')

	const result = await c.get('db').createPate(body)

	return c.json(result, 200)
})

const getPasteRoute = createRoute({
	method: 'get',
	path: '/:id',
	request: {
		params: z.object({
			id: idSchema,
		}),
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: pasteBaseSchema,
				},
			},
		},
	},
})

app.openapi(getPasteRoute, async c => {
	const params = c.req.valid('param')

	const result = await c.get('db').getPaste(params.id)

	return c.json(result, 200)
})

const updatePasteRoute = createRoute({
	method: 'patch',
	path: '/:id',
	request: {
		params: z.object({
			id: idSchema,
		}),
		body: {
			required: true,
			content: {
				'application/json': {
					schema: pasteUpdateSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: pasteBaseSchema,
				},
			},
		},
	},
})

app.openapi(updatePasteRoute, async c => {
	const params = c.req.valid('param')
	const body = c.req.valid('json')

	const result = await c.get('db').updatePaste(params.id, body)

	return c.json(result, 200)
})

const deletePasteRoute = createRoute({
	method: 'delete',
	path: '/:id',
	request: {
		params: z.object({
			id: idSchema,
		}),
	},
	responses: {
		204: {
			description: 'Success',
		},
	},
})

app.openapi(deletePasteRoute, async c => {
	const params = c.req.valid('param')

	const result = await c.get('db').deletePaste(params.id)

	return c.body(null, 204)
})
