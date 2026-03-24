import { OpenAPIHono } from '@hono/zod-openapi'
import type { InjectedEnv } from './env'
import { app as pasteApp } from './paste.controller'
import { app as userApp } from './user.controller'
import { HTTPException } from 'hono/http-exception'

export const app = new OpenAPIHono<InjectedEnv>()

app.route('/pastes', pasteApp)
app.route('/users', userApp)

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ ok: false, message: err.message }, err.status)
	}

	return c.json({ ok: false, message: err.message }, 500)
})

// https://github.com/honojs/hono/issues/3465
app.all('*', c => {
	return c.json({ ok: false, message: 'Not found' }, 404)
})
