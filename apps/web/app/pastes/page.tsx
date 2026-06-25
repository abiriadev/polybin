'use client'

import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	FileText,
	Plus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, PasteList } from '../lib/api'

const snippet = (content: string, max = 140) => {
	const firstLine = content.split('\n').find(line => line.trim().length > 0)
	const stripped = (firstLine ?? '').replace(/^#+\s*/, '').trim()
	return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped
}

export default function PastesListPage() {
	const [data, setData] = useState<PasteList | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [ready, setReady] = useState(false)

	// Initialise from the URL (client-only; static export has no server params).
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		setPage(Math.max(1, Number(params.get('page')) || 1))
		setPageSize(
			Math.min(100, Math.max(1, Number(params.get('pageSize')) || 10)),
		)
		setReady(true)
	}, [])

	useEffect(() => {
		if (!ready) return
		setLoading(true)
		setError(null)
		api.listPastes(page, pageSize)
			.then(setData)
			.catch(err => {
				console.error(err)
				setError(err.message || 'Failed to load pastes')
			})
			.finally(() => setLoading(false))
	}, [ready, page, pageSize])

	const goToPage = (next: number) => {
		setPage(next)
		const url = new URL(window.location.href)
		url.searchParams.set('page', String(next))
		window.history.pushState({}, '', url)
	}

	const totalPages = data
		? Math.max(1, Math.ceil(data.total / data.pageSize))
		: 1

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-4xl p-4 md:p-8">
				<div className="mb-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
					<h1 className="text-2xl font-bold">All Pastes</h1>
					<a
						href="/"
						className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
					>
						<Plus size={16} />
						New Paste
					</a>
				</div>

				{loading ? (
					<div className="text-lg">Loading...</div>
				) : error ? (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
						{error}
					</div>
				) : !data || data.items.length === 0 ? (
					<div className="text-zinc-500">No pastes yet.</div>
				) : (
					<ul className="flex flex-col gap-3">
						{data.items.map(paste => (
							<li key={paste.id} data-testid="paste-item">
								<a
									href={`/pastes/${paste.id}`}
									className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500"
								>
									<div className="flex items-center gap-2 font-semibold">
										<FileText
											className="text-blue-500"
											size={18}
										/>
										{paste.id}
									</div>
									<p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
										{snippet(paste.content) || (
											<span className="italic text-zinc-400">
												(empty)
											</span>
										)}
									</p>
									<div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
										<Calendar size={12} />
										{paste.createdAt.toLocaleString()}
									</div>
								</a>
							</li>
						))}
					</ul>
				)}

				{data && data.total > 0 && (
					<div className="mt-8 flex items-center justify-between">
						<button
							type="button"
							onClick={() => goToPage(page - 1)}
							disabled={page <= 1}
							className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							<ChevronLeft size={16} />
							Previous
						</button>
						<span className="text-sm text-zinc-500">
							Page {page} of {totalPages}
						</span>
						<button
							type="button"
							onClick={() => goToPage(page + 1)}
							disabled={page >= totalPages}
							className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							Next
							<ChevronRight size={16} />
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
