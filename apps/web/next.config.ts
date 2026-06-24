import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import type { NextConfig } from 'next'

const nextConfig = (phase: string): NextConfig => {
	const isDev = phase === PHASE_DEVELOPMENT_SERVER

	return {
		// disable static export in dev mode for the pasting routing to work
		output: isDev ? undefined : 'export',
	}
}

export default nextConfig
