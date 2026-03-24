import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
	userBaseSchema,
	userNewSchem,
	userPasswordUpdateSchema,
	type UserNew,
} from './user.schema'
import type { InjectedEnv } from './env'
import { Hashed } from './hash'
import { apiSuccessResponseSchemaFactory } from './schemas'
import { apiSuccess, r } from './utils'

const idSchema = z.string().openapi({
	param: {
		name: 'id',
		in: 'path',
	},
})

export const app = new OpenAPIHono<InjectedEnv>()

const listUserRoute = createRoute({
	method: 'get',
	path: '/',
	responses: { 200: apiSuccess(userBaseSchema.array()) },
})

app.openapi(listUserRoute, async c => {
	const result = await c.get('db').listUsers()

	return c.json(r(result), 200)
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
	responses: { 200: apiSuccess(userBaseSchema) },
})

app.openapi(createUserRoute, async c => {
	const { password, ...userNew }: UserNew = c.req.valid('json')

	const hashed = await Hashed.computeHash(password)
	const hash = hashed.serialize()

	const result = await c.get('db').createUser({
		...userNew,
		hash,
	})

	return c.json(r(result), 200)
})

const getUserRoute = createRoute({
	method: 'get',
	path: '/:id',
	request: {
		params: z.object({
			id: idSchema,
		}),
	},
	responses: { 200: apiSuccess(userBaseSchema) },
})

app.openapi(getUserRoute, async c => {
	const params = c.req.valid('param')

	const result = await c.get('db').getUser(params.id)

	return c.json(r(result), 200)
})

const updateUserPasswordRoute = createRoute({
	method: 'patch',
	path: '/:id/password',
	request: {
		params: z.object({
			id: idSchema,
		}),
		body: {
			required: true,
			content: {
				'application/json': {
					schema: userPasswordUpdateSchema,
				},
			},
		},
	},
	responses: {
		200: { description: 'Success' },
		403: { description: 'Forbidden' },
	},
})

app.openapi(updateUserPasswordRoute, async c => {
	const params = c.req.valid('param')
	const body = c.req.valid('json')

	const db = c.get('db')

	// check previous hash first
	const hash = await db.getUserHash(params.id)

	const hashed = Hashed.deserialize(hash)

	if (!(await hashed.verify(body.oldPassword))) return c.body(null, 403)

	// set new password
	const newHashed = await Hashed.computeHash(body.newPassword)

	const newHash = newHashed.serialize()

	const result = await db.updateUserHash(params.id, newHash)

	return c.body(null, 200)
})

const deleteUserRoute = createRoute({
	method: 'delete',
	path: '/:id',
	request: {
		params: z.object({
			id: idSchema,
		}),
	},
	responses: { 204: { description: 'Success' } },
})

app.openapi(deleteUserRoute, async c => {
	const params = c.req.valid('param')

	await c.get('db').deleteUser(params.id)

	return c.body(null, 204)
})
