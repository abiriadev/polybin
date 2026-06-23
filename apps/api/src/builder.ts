import { type Generated, Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

interface PasteTable {
	id: Generated<number>
	content: string
	created_at: Generated<string>
}

interface UserTable {
	id: Generated<number>
	name: string
	hash: string
	created_at: Generated<string>
}

interface Database {
	pastes: PasteTable
	users: UserTable
}

export type Builder = Kysely<Database>

export const builderFactory = (binding: D1Database): Builder =>
	new Kysely<Database>({
		dialect: new D1Dialect({ database: binding }),
	})
