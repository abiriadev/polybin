import { OpenAPIHono } from '@hono/zod-openapi'
import type { InjectedEnv } from './env'
import { app as pasteApp } from './paste.controller'
import { app as userApp } from './user.controller'
import { app as authApp } from './auth.controller'
import { HTTPException } from 'hono/http-exception'

export const app = new OpenAPIHono<InjectedEnv>()

app.route('/pastes', pasteApp)
app.route('/users', userApp)
app.route('/auth', authApp)

app.onError((err, c) => {
	const res: { ok: boolean; message: string; cause?: unknown } = {
		ok: false,
		message: err.message,
	}

	console.log(err)
	if (c.env.WORKER_ENV === 'development') res.cause = err.cause

	if (err instanceof HTTPException) return c.json(res, err.status)

	return c.json(res, 500)
})

// https://github.com/honojs/hono/issues/3465
app.all('*', c => {
	return c.json({ ok: false, message: 'Not found' }, 404)
})
