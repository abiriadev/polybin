export interface Paste {
	id: string
	content: string
	createdAt: Date
}

export interface PasteNew {
	content: string
}

export interface PasteUpdate {
	content?: string
}

export interface PasteList {
	items: Paste[]
	total: number
	page: number
	pageSize: number
}

class Api {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	private async request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${path}`
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		})

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ message: 'An unknown error occurred' }))
			throw new Error(
				error.message || `HTTP error! status: ${response.status}`,
			)
		}

		if (response.status === 204) {
			return null as unknown as T
		}

		// the API wraps every payload as `{ ok, message, data }`
		const json = await response.json()
		return json.data as T
	}

	private parsePaste(paste: any): Paste {
		return {
			...paste,
			createdAt: new Date(paste.createdAt),
		}
	}

	async listPastes(page = 1, pageSize = 10): Promise<PasteList> {
		const response = await this.request<any>(
			`/api/pastes?page=${page}&pageSize=${pageSize}`,
		)
		return {
			...response,
			items: response.items.map((p: any) => this.parsePaste(p)),
		}
	}

	async createPaste(paste: PasteNew): Promise<Paste> {
		const response = await this.request<any>('/api/pastes', {
			method: 'POST',
			body: JSON.stringify(paste),
		})
		return this.parsePaste(response)
	}

	async getPaste(id: string): Promise<Paste> {
		const response = await this.request<any>(`/api/pastes/${id}`)
		return this.parsePaste(response)
	}

	async updatePaste(id: string, paste: PasteUpdate): Promise<Paste> {
		const response = await this.request<any>(`/api/pastes/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(paste),
		})
		return this.parsePaste(response)
	}

	async deletePaste(id: string): Promise<void> {
		return this.request<void>(`/api/pastes/${id}`, {
			method: 'DELETE',
		})
	}
}

// In a real application, you'd likely use an environment variable here.
// For now, we'll assume the API is running at http://localhost:8787
export const api = new Api(
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
)
