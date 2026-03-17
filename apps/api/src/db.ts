import type { PasteBase, PasteNew, PasteUpdate } from '@/schemas'

export class Db {
	#driver: D1Database

	constructor(driver: D1Database) {
		this.#driver = driver
	}

	async initSchema() {
		await this.#driver
			.prepare(
				`create table if not exists pastes (
					id integer primary key,
					content text,
					created_at text default current_timestamp
				)`,
			)
			.run()
	}

	async createPate(pasteNew: PasteNew): Promise<PasteBase> {
		const result = await this.#driver
			.prepare(`insert into pastes (content) values (?) returning *`)
			.bind(pasteNew.content)
			.first<{
				id: number
				content: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to create paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async listPastes(): Promise<PasteBase[]> {
		const result = await this.#driver.prepare(`select * from pastes`).run<{
			id: number
			content: string
			created_at: string
		}>()

		if (!result.success) throw new Error('Failed to list pastes')

		return result.results.map(paste => ({
			id: paste.id.toString(),
			content: paste.content,
			createdAt: new Date(paste.createdAt),
		}))
	}

	async getPaste(id: string): Promise<PasteBase> {
		const result = await this.#driver
			.prepare(`select * from pastes where id = ?`)
			.bind(id)
			.first<{
				id: number
				content: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to get paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async updatePaste(
		id: string,
		pasteUpdate: PasteUpdate,
	): Promise<PasteBase> {
		const result = await this.#driver
			.prepare(`update pastes set content = ? where id = ? returning *`)
			.bind(pasteUpdate.content)
			.first<{
				id: number
				content: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to update paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async deletePaste(id: string): Promise<PasteBase> {
		const result = await this.#driver
			.prepare(`delete from pastes where id = ? returning *`)
			.bind(id)
			.first<{
				id: number
				content: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to delete paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}
}
