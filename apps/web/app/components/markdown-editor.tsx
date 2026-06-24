'use client'

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { useState } from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { useTheme } from '../hooks/useTheme'

const tabClass = (active: boolean) =>
	`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
		active
			? 'border-blue-500 text-blue-600 dark:text-blue-400'
			: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
	}`

interface MarkdownEditorProps {
	value: string
	onChange: (value: string) => void
	editable?: boolean
	autoFocus?: boolean
	placeholder?: string
}

export default function MarkdownEditor({
	value,
	onChange,
	editable = true,
	autoFocus = false,
	placeholder = 'Paste your content here...',
}: MarkdownEditorProps) {
	const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
	const theme = useTheme()

	return (
		<div className="flex flex-col gap-4">
			<div className="flex border-b border-zinc-300 dark:border-zinc-700">
				<button
					type="button"
					className={tabClass(activeTab === 'write')}
					onClick={() => setActiveTab('write')}
				>
					Write
				</button>
				<button
					type="button"
					className={tabClass(activeTab === 'preview')}
					onClick={() => setActiveTab('preview')}
				>
					Preview
				</button>
			</div>

			{activeTab === 'write' ? (
				<CodeMirror
					className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
					minHeight="400px"
					placeholder={placeholder}
					value={value}
					extensions={[
						markdown({
							base: markdownLanguage,
							codeLanguages: languages,
						}),
					]}
					theme={theme === 'dark' ? githubDark : githubLight}
					onChange={onChange}
					autoFocus={autoFocus}
					editable={editable}
				/>
			) : (
				<div className="w-full min-h-[400px] p-4 md:p-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-foreground overflow-auto">
					{value ? (
						<article className="prose prose-zinc dark:prose-invert max-w-none">
							<Markdown
								remarkPlugins={[remarkGfm, remarkMath]}
								rehypePlugins={[rehypeKatex]}
							>
								{value}
							</Markdown>
						</article>
					) : (
						<span className="text-zinc-400 italic">
							Nothing to preview
						</span>
					)}
				</div>
			)}
		</div>
	)
}
