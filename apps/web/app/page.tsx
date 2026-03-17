'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './lib/api'
import CodeMirror from '@uiw/react-codemirror'
import Markdown from 'react-markdown'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { useTheme } from './hooks/useTheme'

export default function Home() {
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
	const router = useRouter()
	const theme = useTheme()

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
				<h1 className="text-3xl font-bold">Polybin</h1>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex border-b border-zinc-300 dark:border-zinc-700">
						<button
							type="button"
							className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'write'
								? 'border-blue-500 text-blue-600 dark:text-blue-400'
								: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
								}`}
							onClick={() => setActiveTab('write')}
						>
							Write
						</button>
						<button
							type="button"
							className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'preview'
								? 'border-blue-500 text-blue-600 dark:text-blue-400'
								: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
								}`}
							onClick={() => {
								console.log('Preview clicked')

								setActiveTab('preview')
							}}
						>
							Preview
						</button>
					</div>

					{activeTab === 'write' ? (
						<CodeMirror
							className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
							minHeight='400px'
							placeholder="Paste your content here..."
							value={content}
							extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
							theme={theme === 'dark' ? githubDark : githubLight}
							onChange={e => setContent(e)}
							autoFocus
							editable={!isSubmitting}
						/>
					) : (
						<div className="w-full min-h-[400px] p-4 md:p-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-foreground overflow-auto">
							{content ? (
								<article className="prose prose-zinc dark:prose-invert max-w-none">
									<Markdown>{content}</Markdown>
								</article>
							) : (
								<span className="text-zinc-400 italic">
									Nothing to preview
								</span>
							)}
						</div>
					)}
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
