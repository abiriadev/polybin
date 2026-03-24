import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { InjectedEnv } from './env'
import { apiSuccess, body, r } from './utils'
import { authRequestSchema, authResponseSchema } from './auth.schema'
import { sign } from 'hono/jwt'
import { verifyPassword } from './auth.service'
import { HTTPException } from 'hono/http-exception'

export const app = new OpenAPIHono<InjectedEnv>()

const signinRoute = createRoute({
	method: 'post',
	path: '/signin',
	request: { body: body(authRequestSchema) },
	responses: { 200: apiSuccess(authResponseSchema, 'Sign in successful') },
})

app.openapi(signinRoute, async c => {
	const body = c.req.valid('json')

	const user = await c.var.db.getUserByName(body.name)

	const verifyResult = await verifyPassword(c.var.db, user.id, body.password)

	if (!verifyResult)
		throw new HTTPException(401, { message: 'Invalid credentials' })

	// 1 day
	const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24

	const token = await sign({ id: user.id, exp }, c.env['JWT_SECRET'], 'HS256')

	return c.json(r({ token }), 200)
})
