export const r = <T>(data: T, message?: string) =>
	({
		ok: true,
		message: message ?? 'Success (default)',
		data,
	}) as const
