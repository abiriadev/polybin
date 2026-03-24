import { OpenAPIHono } from '@hono/zod-openapi'
import type { InjectedEnv } from './env'
import { app as pasteApp } from './paste.controller'
import { app as userApp } from './user.controller'

export const app = new OpenAPIHono<InjectedEnv>()

app.route('/pastes', pasteApp)
app.route('/users', userApp)
