'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme(): Theme {
	const [theme, setTheme] = useState<Theme>('light')

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		
		const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
			setTheme(e.matches ? 'dark' : 'light')
		}

		setTheme(mediaQuery.matches ? 'dark' : 'light')
		mediaQuery.addEventListener('change', updateTheme)
		
		return () => mediaQuery.removeEventListener('change', updateTheme)
	}, [])

	return theme
}
