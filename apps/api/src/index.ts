import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { version } from '../package.json'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { app as apiApp } from './api'
import { Db } from './db'
import type { InjectedEnv } from './env'

const app = new OpenAPIHono<InjectedEnv>()
export default app

app.use('*', logger())
app.use('*', cors())

app.use('*', async (c, next) => {
	const db = new Db(c.env.db)
	await db.initSchema()

	c.set('db', db)
	await next()
})

app.get('/', c => {
	return c.json({
		version,
	})
})

// generate openapi json
app.doc('/openapi', {
	openapi: '3.1.0',
	info: { version, title: 'Polybin API' },
})

// show swagger ui
app.get(
	'/openapi/ui',
	swaggerUI({
		url: '/openapi',
	}),
)

app.route('/api', apiApp)
