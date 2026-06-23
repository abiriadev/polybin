import { sql } from 'kysely'
import type { Builder } from './builder'
import type { PasteBase, PasteNew, PasteUpdate } from './paste.schema'
import type { UserBase, UserNewWithHash } from './user.schema'

export class Db {
	#builder: Builder

	constructor(builder: Builder) {
		this.#builder = builder
	}

	async initSchema() {
		await this.#builder.schema
			.createTable('pastes')
			.ifNotExists()
			.addColumn('id', 'integer', col => col.primaryKey())
			.addColumn('content', 'text')
			.addColumn('created_at', 'text', col =>
				col.defaultTo(sql`current_timestamp`),
			)
			.execute()

		await this.#builder.schema
			.createTable('users')
			.ifNotExists()
			.addColumn('id', 'integer', col => col.primaryKey())
			.addColumn('name', 'text', col => col.unique())
			.addColumn('hash', 'text')
			.addColumn('created_at', 'text', col =>
				col.defaultTo(sql`current_timestamp`),
			)
			.execute()
	}

	async createPaste(pasteNew: PasteNew): Promise<PasteBase> {
		const result = await this.#builder
			.insertInto('pastes')
			.values({ content: pasteNew.content })
			.returningAll()
			.executeTakeFirst()

		if (!result) throw new Error('Failed to create paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async listPastes(): Promise<PasteBase[]> {
		const result = await this.#builder
			.selectFrom('pastes')
			.selectAll()
			.execute()

		return result.map(paste => ({
			id: paste.id.toString(),
			content: paste.content,
			createdAt: new Date(paste.created_at),
		}))
	}

	async getPaste(id: string): Promise<PasteBase> {
		const result = await this.#builder
			.selectFrom('pastes')
			.selectAll()
			.where('id', '=', Number(id))
			.executeTakeFirst()

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
		const result = await this.#builder
			.updateTable('pastes')
			.set({ content: pasteUpdate.content })
			.where('id', '=', Number(id))
			.returningAll()
			.executeTakeFirst()

		if (!result) throw new Error('Failed to update paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async deletePaste(id: string): Promise<PasteBase> {
		const result = await this.#builder
			.deleteFrom('pastes')
			.where('id', '=', Number(id))
			.returningAll()
			.executeTakeFirst()

		if (!result) throw new Error('Failed to delete paste')

		return {
			id: result.id.toString(),
			content: result.content,
			createdAt: new Date(result.created_at),
		}
	}

	async createUser(userNew: UserNewWithHash): Promise<UserBase> {
		const result = await this.#builder
			.insertInto('users')
			.values({ name: userNew.name, hash: userNew.hash })
			.returningAll()
			.executeTakeFirst()

		if (!result) throw new Error('Failed to create user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}

	async listUsers(): Promise<UserBase[]> {
		const result = await this.#builder
			.selectFrom('users')
			.selectAll()
			.execute()

		return result.map(user => ({
			id: user.id.toString(),
			name: user.name,
			createdAt: new Date(user.created_at),
		}))
	}

	async getUser(id: string): Promise<UserBase> {
		const result = await this.#builder
			.selectFrom('users')
			.selectAll()
			.where('id', '=', Number(id))
			.executeTakeFirst()

		if (!result) throw new Error('Failed to get user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}

	async getUserByName(name: string): Promise<UserBase> {
		const result = await this.#builder
			.selectFrom('users')
			.selectAll()
			.where('name', '=', name)
			.executeTakeFirst()

		if (!result) throw new Error('Failed to get user by name')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}

	async getUserHash(id: string): Promise<string> {
		const result = await this.#builder
			.selectFrom('users')
			.select('hash')
			.where('id', '=', Number(id))
			.executeTakeFirst()

		if (!result) throw new Error('Failed to get user hash')

		return result.hash
	}

	async updateUserHash(id: string, hash: string): Promise<void> {
		await this.#builder
			.updateTable('users')
			.set({ hash })
			.where('id', '=', Number(id))
			.execute()
	}

	async deleteUser(id: string): Promise<UserBase> {
		const result = await this.#builder
			.deleteFrom('users')
			.where('id', '=', Number(id))
			.returningAll()
			.executeTakeFirst()

		if (!result) throw new Error('Failed to delete user')

		return {
			id: result.id.toString(),
			name: result.name,
			createdAt: new Date(result.created_at),
		}
	}
}
