'use client'

import { useEffect, useState } from 'react'
import { api, Paste } from '../../lib/api'
import MarkdownEditor from '../../components/markdown-editor'
import Markdown from 'react-markdown'
import { Calendar, FileText, ChevronLeft, Pencil, Save, X } from 'lucide-react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function PasteView() {
	const [paste, setPaste] = useState<Paste | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isEditing, setIsEditing] = useState(false)
	const [draft, setDraft] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	// Under `output: export` the page is the prerendered `placeholder` shell
	// served for every id via the CF Pages rewrite, so `useParams()` yields
	// `placeholder` rather than the real id.
	// Read it from the live URL instead.
	useEffect(() => {
		const id = window.location.pathname.split('/').filter(Boolean).pop()
		if (!id) {
			setLoading(false)
			return
		}

		api.getPaste(id)
			.then(setPaste)
			.catch(err => {
				console.error(err)
				setError(err.message || 'Failed to fetch paste')
			})
			.finally(() => setLoading(false))
	}, [])

	const startEditing = () => {
		if (!paste) return
		setDraft(paste.content)
		setIsEditing(true)
	}

	const cancelEditing = () => setIsEditing(false)

	const saveEditing = async () => {
		if (!paste) return
		setIsSaving(true)
		try {
			const updated = await api.updatePaste(paste.id, { content: draft })
			setPaste(updated)
			setIsEditing(false)
		} catch (err) {
			console.error('Failed to update paste:', err)
			alert('Failed to save changes. Please try again.')
		} finally {
			setIsSaving(false)
		}
	}

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
			<div className="mx-auto max-w-4xl p-4 md:p-8">
				<div className="mb-8 flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
					<div className="flex items-center justify-between">
						<a
							href="/"
							className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
						>
							<ChevronLeft size={16} />
							New Paste
						</a>
						{isEditing ? (
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={cancelEditing}
									disabled={isSaving}
									className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
								>
									<X size={16} />
									Cancel
								</button>
								<button
									type="button"
									onClick={saveEditing}
									disabled={isSaving}
									className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
								>
									<Save size={16} />
									{isSaving ? 'Saving...' : 'Save'}
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={startEditing}
								className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
							>
								<Pencil size={16} />
								Edit
							</button>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileText className="text-blue-500" size={24} />
							{paste.id}
						</h1>
						<div className="flex items-center gap-2 text-sm text-zinc-500">
							<Calendar size={14} />
							<span>{paste.createdAt.toLocaleString()}</span>
						</div>
					</div>
				</div>
				{isEditing ? (
					<MarkdownEditor
						value={draft}
						onChange={setDraft}
						editable={!isSaving}
						autoFocus
					/>
				) : (
					<article className="prose prose-zinc dark:prose-invert max-w-none">
						<Markdown
							remarkPlugins={[remarkGfm, remarkMath]}
							rehypePlugins={[rehypeKatex]}
						>
							{paste.content}
						</Markdown>
					</article>
				)}
			</div>
		</div>
	)
}
