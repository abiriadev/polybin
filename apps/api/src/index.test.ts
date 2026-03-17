import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from './index'

// Mock D1Database
const mockD1 = {
	prepare: vi.fn().mockReturnThis(),
	bind: vi.fn().mockReturnThis(),
	first: vi.fn(),
	run: vi.fn(),
	all: vi.fn(),
	exec: vi.fn(),
	batch: vi.fn(),
	dump: vi.fn(),
} as any

describe('Polybin API', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockD1.prepare.mockReturnThis()
		mockD1.bind.mockReturnThis()
	})

	it('should return version on root', async () => {
		const res = await app.request('/', {}, { db: mockD1 })
		expect(res.status).toBe(200)
		const body = (await res.json()) as any
		expect(body).toHaveProperty('version')
	})

	describe('Pastes API', () => {
		it('should create a paste', async () => {
			const mockPaste = {
				id: 1,
				content: 'Hello World',
				created_at: new Date().toISOString(),
			}
			mockD1.first.mockResolvedValue(mockPaste)
			mockD1.run.mockResolvedValue({ success: true })

			const res = await app.request(
				'/api/pastes',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ content: 'Hello World' }),
				},
				{ db: mockD1 },
			)

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.content).toBe('Hello World')
			expect(body.id).toBe('1')
		})

		it('should list pastes', async () => {
			const mockPastes = [
				{
					id: 1,
					content: 'Paste 1',
					created_at: new Date().toISOString(),
				},
				{
					id: 2,
					content: 'Paste 2',
					created_at: new Date().toISOString(),
				},
			]
			mockD1.run.mockResolvedValue({
				success: true,
				results: mockPastes,
			})

			const res = await app.request('/api/pastes', {}, { db: mockD1 })

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(Array.isArray(body)).toBe(true)
			expect(body.length).toBe(2)
			expect(body[0].content).toBe('Paste 1')
		})

		it('should get a paste by id', async () => {
			const mockPaste = {
				id: 1,
				content: 'Hello World',
				created_at: new Date().toISOString(),
			}
			mockD1.first.mockResolvedValue(mockPaste)

			const res = await app.request('/api/pastes/1', {}, { db: mockD1 })

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.id).toBe('1')
			expect(body.content).toBe('Hello World')
		})

		it('should update a paste', async () => {
			const mockPaste = {
				id: 1,
				content: 'Updated Content',
				created_at: new Date().toISOString(),
			}
			mockD1.first.mockResolvedValue(mockPaste)

			const res = await app.request(
				'/api/pastes/1',
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ content: 'Updated Content' }),
				},
				{ db: mockD1 },
			)

			expect(res.status).toBe(200)
			const body = (await res.json()) as any
			expect(body.content).toBe('Updated Content')
		})

		it('should delete a paste', async () => {
			const mockPaste = {
				id: 1,
				content: 'To be deleted',
				created_at: new Date().toISOString(),
			}
			mockD1.first.mockResolvedValue(mockPaste)

			const res = await app.request(
				'/api/pastes/1',
				{
					method: 'DELETE',
				},
				{ db: mockD1 },
			)

			expect(res.status).toBe(204)
		})
	})
})
