'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './lib/api'
import MarkdownEditor from './components/markdown-editor'

export default function Home() {
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!content.trim()) return

		setIsSubmitting(true)
		try {
			const paste = await api.createPaste({ content })
			router.push(`/pastes/${paste.id}`)
		} catch (error) {
			console.error('Failed to create paste:', error)
			alert('Failed to create paste. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans p-4">
			<main className="flex w-full max-w-4xl flex-col gap-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Polybin</h1>
					<a
						href="/pastes"
						className="text-sm text-blue-600 hover:underline dark:text-blue-400"
					>
						Browse all pastes →
					</a>
				</div>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<MarkdownEditor
						value={content}
						onChange={setContent}
						editable={!isSubmitting}
						autoFocus
					/>
					<div className="flex justify-end">
						<button
							type="submit"
							className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							disabled={isSubmitting || !content.trim()}
						>
							{isSubmitting ? 'Pasting...' : 'Paste'}
						</button>
					</div>
				</form>
			</main>
		</div>
	)
}
