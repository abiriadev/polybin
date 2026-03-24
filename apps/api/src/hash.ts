const strToBuffer = (str: string) => {
	const enc = new TextEncoder()

	return enc.encode(str).buffer as ArrayBuffer
}

type Phc = {
	id: string
	version?: string
	params?: Record<string, string>
	salt?: ArrayBuffer
	hash?: ArrayBuffer
}

const phcAtob = (str: string) =>
	Uint8Array.fromBase64(
		str.padEnd(str.length + ((4 - (str.length % 4)) % 4), '='),
	).buffer

const phcBtoa = (buffer: ArrayBuffer) =>
	new Uint8Array(buffer).toBase64().replace('=', '')

const phcDeserialize = (serialized: string): Phc => {
	const components = serialized.split('$')

	if (components.length <= 1) throw new Error('Invalid PHC string')

	components.shift()

	const id = components.shift()!

	const phc: Phc = { id }

	if (components[0]?.startsWith('v='))
		phc.version = components.shift()!.substring(2)

	if (components[0]?.indexOf('=') != -1) {
		const params = components.shift()!

		phc.params = Object.fromEntries(
			params.split(',').map(p => p.split('=') as [string, string]),
		)
	}

	if (components[0]) {
		phc.salt = phcAtob(components.shift()!)

		if (components[0]) phc.hash = phcAtob(components.shift()!)
	}

	return phc
}

const phcSerialize = (phc: Phc) => {
	let str = ``

	str += `$${phc.id}`

	if (phc.version) str += `$v=${phc.version}`
	if (phc.params)
		str +=
			'$' +
			Object.entries(phc.params)
				.map(([k, v]) => `${k}=${v}`)
				.join(',')

	if (phc.salt) str += `$${phcBtoa(phc.salt)}`
	if (phc.hash) str += `$${phcBtoa(phc.hash)}`

	return str
}

/**
 * Configuration options for hashing using PBKDF2.
 */
type HashOptions = {
	/** Number of iterations for PBKDF2. Higher is more secure but slower. */
	iterations: number
	/** Desired length of the derived key in bits. */
	length: number
	/** Hash algorithm to use with PBKDF2 (e.g., 'SHA-256' or 'SHA-512'). */
	hashAlgorithm: 'SHA-256' | 'SHA-512'
	/** Optional salt to use. If not provided, a random salt will be generated. */
	salt?: string
}

/**
 * Utility class for secure password hashing and verification using PBKDF2.
 * This class leverages the Web Crypto API for cryptographic operations.
 */
export class Hashed {
	static #phcDeserialize(serialized: string) {
		const phc = phcDeserialize(serialized)
		const options: HashOptions = {} as HashOptions

		if (!phc.id.startsWith('pbkdf2-')) throw new Error('Not a PBKDF2 hash')

		if (phc.id.substring(7) === 'sha256') options.hashAlgorithm = 'SHA-256'
		else if (phc.id.substring(7) === 'sha512')
			options.hashAlgorithm = 'SHA-512'
		else throw new Error('Invalid PBKDF2 hash algorithm')

		if (!phc.params?.['i']) throw new Error('Missing iterations parameter')
		options.iterations = parseInt(phc.params['i'])

		if (!phc.params?.['l']) throw new Error('Missing length parameter')
		options.length = parseInt(phc.params['l'])

		if (!phc.salt) throw new Error('Missing salt parameter')
		const salt = phc.salt

		if (!phc.hash) throw new Error('Missing hash parameter')
		const hash = phc.hash

		return [hash, salt, options] as const
	}

	static #phcSerialize(
		hash: ArrayBuffer,
		salt: ArrayBuffer,
		{ iterations, length, hashAlgorithm }: HashOptions,
	) {
		const phc = {
			id: `pbkdf2-${hashAlgorithm.toLowerCase()}`,
			hash,
			salt,
			params: {
				i: iterations.toString(),
				l: length.toString(),
			},
		}

		return phcSerialize(phc)
	}

	/**
	 * Merges provided options with default hashing parameters.
	 */
	static #resolveOptions(options?: Partial<HashOptions>): HashOptions {
		return {
			iterations: options?.iterations ?? 600000,
			length: options?.length ?? 256,
			hashAlgorithm: options?.hashAlgorithm ?? 'SHA-256',
			salt: options?.salt,
		}
	}

	/**
	 * Imports a raw secret string into a CryptoKey for PBKDF2 derivation.
	 */
	static async #importStrKey(key: string) {
		return await crypto.subtle.importKey(
			'raw',
			strToBuffer(key),
			'PBKDF2',
			false,
			['deriveBits'],
		)
	}

	/**
	 * Internal method to derive a PBKDF2 hash using a specific salt.
	 */
	static async #computeHashWithSalt(
		secret: string,
		salt: ArrayBuffer,
		options: HashOptions,
	) {
		const { iterations, length, hashAlgorithm } = options

		const baseKey = await Hashed.#importStrKey(secret)

		const hash = await crypto.subtle.deriveBits(
			{ name: 'PBKDF2', hash: hashAlgorithm, salt, iterations },
			baseKey,
			length,
		)

		return new Hashed(hash, salt, options)
	}

	/**
	 * Computes a hash for the given secret string.
	 * If no salt is provided in options, a new random salt is generated.
	 *
	 * @param secret The string to hash (e.g., a password).
	 * @param options Optional overrides for hashing parameters.
	 * @returns A Hashed instance containing the result.
	 */
	static async computeHash(secret: string, options?: Partial<HashOptions>) {
		const resolvedOptions = this.#resolveOptions(options)

		let salt = resolvedOptions.salt
			? strToBuffer(resolvedOptions.salt)
			: (crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer)

		return await this.#computeHashWithSalt(secret, salt!, resolvedOptions)
	}

	/**
	 * Creates a Hashed instance from a serialized hash string.
	 * The serialized format is expected to be PHC-compatible.
	 *
	 * @param serialized The PHC-compatible serialized hash string.
	 */
	static async deserialize(serialized: string) {
		const [hash, salt, options] = this.#phcDeserialize(serialized)

		return new Hashed(hash, salt, options)
	}

	readonly #hash: ArrayBuffer
	readonly #salt: ArrayBuffer
	readonly #options: HashOptions

	constructor(hash: ArrayBuffer, salt: ArrayBuffer, options: HashOptions) {
		this.#hash = hash
		this.#salt = salt
		this.#options = options
	}

	/**
	 * Serializes the hash and salt into a format suitable for database storage.
	 * @returns A PHC-compatible serialized hash string.
	 */
	serialize() {
		return Hashed.#phcSerialize(this.#hash, this.#salt, this.#options)
	}

	/**
	 * Constant-time comparison of two hashes to prevent timing attacks.
	 */
	#cmp(compare: Hashed) {
		const thisBuf = new Uint8Array(this.#hash)
		const cmpBuf = new Uint8Array(compare.#hash)

		if (thisBuf.length !== cmpBuf.length) return false

		let result = 0
		for (let i = 0; i < thisBuf.length; i++)
			result |= thisBuf[i]! ^ cmpBuf[i]!

		return result === 0
	}

	/**
	 * Verifies that a plain text string matches this hash.
	 * @param compare The plain text secret to verify.
	 * @returns True if the secret matches the hash, false otherwise.
	 */
	async verify(compare: string) {
		const compareHash = await Hashed.#computeHashWithSalt(
			compare,
			this.#salt,
			this.#options,
		)

		return this.#cmp(compareHash)
	}
}
