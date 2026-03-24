import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { userBaseSchema, userNewSchem, type UserNew } from './user.schema'
import type { InjectedEnv } from './env'
import { Hashed } from './hash'

const idSchema = z.string().openapi({
	param: {
		name: 'id',
		in: 'path',
	},
})

export const app = new OpenAPIHono<InjectedEnv>()

const listUserRoute = createRoute({
	method: 'get',
	path: '/users',
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: userBaseSchema.array(),
				},
			},
		},
	},
})

app.openapi(listUserRoute, async c => {
	const result = await c.get('db').listUsers()

	return c.json(result, 200)
})

const createUserRoute = createRoute({
	method: 'post',
	path: '/',
	request: {
		body: {
			required: true,
			content: {
				'application/json': {
					schema: userNewSchem,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: userBaseSchema,
				},
			},
		},
	},
})

app.openapi(createUserRoute, async c => {
	const { password, ...userNew }: UserNew = c.req.valid('json')

	const hashed = await Hashed.computeHash(password)
	const hash = hashed.serialize()

	const result = await c.get('db').createUser({
		...userNew,
		hash,
	})

	return c.json(result, 200)
})

const getUserRoute = createRoute({
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
					schema: userBaseSchema,
				},
			},
		},
	},
})

app.openapi(getUserRoute, async c => {
	const params = c.req.valid('param')

	const result = await c.get('db').getUser(params.id)

	return c.json(result, 200)
})

const deleteUserRoute = createRoute({
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

app.openapi(deleteUserRoute, async c => {
	const params = c.req.valid('param')

	await c.get('db').deleteUser(params.id)

	return c.body(null, 204)
})
