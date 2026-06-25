import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import app from './index'

// Minimal D1Database adapter backed by an in-memory better-sqlite3 instance.
// kysely-d1 only ever calls `prepare(sql).bind(...params).all()`, expecting a
// result of the shape `{ results, success, meta: { changes, last_row_id } }`.
const createD1 = (): D1Database => {
	const sqlite = new Database(':memory:')

	const prepare = (sql: string) => {
		const stmt = sqlite.prepare(sql)
		let params: unknown[] = []

		const statement = {
			bind(...values: unknown[]) {
				params = values
				return statement
			},
			async all() {
				if (stmt.reader) {
					return {
						success: true,
						results: stmt.all(...params),
						meta: { changes: 0, last_row_id: 0 },
					}
				}

				const info = stmt.run(...params)
				return {
					success: true,
					results: [],
					meta: {
						changes: info.changes,
						last_row_id: Number(info.lastInsertRowid),
					},
				}
			},
		}

		return statement
	}

	return { prepare } as unknown as D1Database
}

const createPaste = (db: D1Database, content: string) =>
	app.request(
		'/api/pastes',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content }),
		},
		{ db },
	)

const createPasteId = async (db: D1Database, content: string) => {
	const res = await createPaste(db, content)
	const body = (await res.json()) as any
	return body.data.id as string
}

const PASTE_ID = /^[A-Za-z0-9]{6}$/

describe('Polybin API', () => {
	let db: D1Database

	beforeEach(() => {
		db = createD1()
	})

	it('should return version on root', async () => {
		const res = await app.request('/', {}, { db })
		expect(res.status).toBe(200)
		const body = (await res.json()) as any
		expect(body).toHaveProperty('version')
	})

	describe('Pastes API', () => {
		it('should create a paste', async () => {
			const res = await createPaste(db, 'Hello World')

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.data.content).toBe('Hello World')
			expect(body.data.id).toMatch(PASTE_ID)
		})

		it('should list pastes', async () => {
			await createPaste(db, 'Paste 1')
			await createPaste(db, 'Paste 2')

			const res = await app.request('/api/pastes', {}, { db })

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.data.total).toBe(2)
			expect(body.data.page).toBe(1)
			expect(Array.isArray(body.data.items)).toBe(true)
			expect(body.data.items.length).toBe(2)
			const contents = body.data.items.map((p: any) => p.content)
			expect(contents).toContain('Paste 1')
			expect(contents).toContain('Paste 2')
		})

		it('should paginate pastes', async () => {
			for (const content of ['a', 'b', 'c']) {
				await createPaste(db, content)
			}

			const res = await app.request(
				'/api/pastes?page=2&pageSize=2',
				{},
				{ db },
			)

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.data.total).toBe(3)
			expect(body.data.page).toBe(2)
			expect(body.data.pageSize).toBe(2)
			expect(body.data.items.length).toBe(1)
		})

		it('should get a paste by id', async () => {
			const id = await createPasteId(db, 'Hello World')

			const res = await app.request(`/api/pastes/${id}`, {}, { db })

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.data.id).toBe(id)
			expect(body.data.content).toBe('Hello World')
		})

		it('should update a paste', async () => {
			const id = await createPasteId(db, 'Original Content')

			const res = await app.request(
				`/api/pastes/${id}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content: 'Updated Content' }),
				},
				{ db },
			)

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.data.content).toBe('Updated Content')
		})

		it('should delete a paste', async () => {
			const id = await createPasteId(db, 'To be deleted')

			const res = await app.request(
				`/api/pastes/${id}`,
				{ method: 'DELETE' },
				{ db },
			)

			expect(res.status).toBe(204)
		})
	})
})
