'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, Paste } from '../../lib/api'

export default function ViewPastePage() {
	const params = useParams()
	const id = params.id as string
	const [paste, setPaste] = useState<Paste | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (id) {
			api.getPaste(id)
				.then(setPaste)
				.catch(err => {
					console.error(err)
					setError(err.message || 'Failed to fetch paste')
				})
				.finally(() => setLoading(false))
		}
	}, [id])

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<div className="text-lg">Loading...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
					<h2 className="text-lg font-bold">Error</h2>
					<p>{error}</p>
					<a
						href="/"
						className="mt-4 inline-block text-blue-500 hover:underline"
					>
						Go back to paste
					</a>
				</div>
			</div>
		)
	}

	if (!paste) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
				<div className="text-lg">Paste not found</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-4xl p-4">
				<div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
					<div>
						<h1 className="text-xl font-bold">Paste: {paste.id}</h1>
						<p className="text-sm text-zinc-500">
							Created at: {paste.createdAt.toLocaleString()}
						</p>
					</div>
					<a
						href="/"
						className="rounded bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
					>
						New Paste
					</a>
				</div>
				<div className="rounded bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
					<pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm">
						{paste.content}
					</pre>
				</div>
			</div>
		</div>
	)
}
