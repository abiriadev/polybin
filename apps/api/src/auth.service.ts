import type { Db } from './db'
import { Hashed } from './hash'

export const verifyPassword = async (
	db: Db,
	id: string,
	password: string,
): Promise<boolean> => {
	const hash = await db.getUserHash(id)

	const hashed = Hashed.deserialize(hash)

	return await hashed.verify(password)
}
