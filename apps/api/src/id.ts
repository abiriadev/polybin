const ALPHABET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Random alphanumeric id for pastes (e.g. `aZ3kP9`). 62^6 ≈ 5.7e10 keyspace.
export const generatePasteId = (length = 6): string => {
	const bytes = crypto.getRandomValues(new Uint8Array(length))
	let id = ''
	for (const byte of bytes) {
		id += ALPHABET[byte % ALPHABET.length]!
	}
	return id
}
