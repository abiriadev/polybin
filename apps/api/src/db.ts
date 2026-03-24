import type { PasteBase, PasteNew, PasteUpdate } from './paste.schema'
import type { UserBase, UserNewWithHash } from './user.schema'

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
				);

				create table if not exists users (
					id integer primary key,
					name text unique,
					hash text,
					created_at text default current_timestamp
				);
				`,
			)
			.run()
	}

	async createPaste(pasteNew: PasteNew): Promise<PasteBase> {
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
			createdAt: new Date(paste.created_at),
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

	async createUser(userNew: UserNewWithHash): Promise<UserBase> {
		const result = await this.#driver
			.prepare(`insert into users (name, hash) values (?, ?) returning *`)
			.bind(userNew.name, userNew.hash)
			.first<{
				id: number
				name: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to create user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}

	async listUsers(): Promise<UserBase[]> {
		const result = await this.#driver.prepare(`select * from users`).run<{
			id: number
			name: string
			created_at: string
		}>()

		if (!result.success) throw new Error('Failed to list users')

		return result.results.map(user => ({
			id: user.id.toString(),
			name: user.name,
			createdAt: new Date(user.created_at),
		}))
	}

	async getUser(id: string): Promise<UserBase> {
		const result = await this.#driver
			.prepare(`select * from users where id = ?`)
			.bind(id)
			.first<{
				id: number
				name: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to get user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}

	async getUserHash(id: string): Promise<string> {
		const result = await this.#driver
			.prepare(`select hash from users where id = ?`)
			.bind(id)
			.first<{
				hash: string
			}>()

		if (!result) throw new Error('Failed to get user hash')

		return result.hash
	}

	async updateUserHash(id: string, hash: string): Promise<void> {
		const result = await this.#driver
			.prepare(`update users set hash = ? where id = ?`)
			.bind(hash, id)
			.run()

		if (!result.success) throw new Error('Failed to update user hash')
	}

	async deleteUser(id: string): Promise<UserBase> {
		const result = await this.#driver
			.prepare(`delete from users where id = ? returning *`)
			.bind(id)
			.first<{
				id: number
				name: string
				created_at: string
			}>()

		if (!result) throw new Error('Failed to delete user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}
}
