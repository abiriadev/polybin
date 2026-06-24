import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// The Playwright-bundled Chromium can't load system libs on Nix. Use a system
// browser there; elsewhere fall back to the bundled one. `PLAYWRIGHT_CHROMIUM_PATH`
// always overrides.
function resolveBrowserPath(): string | undefined {
	if (process.env.PLAYWRIGHT_CHROMIUM_PATH) {
		return process.env.PLAYWRIGHT_CHROMIUM_PATH
	}
	if (!process.env.NIX_PROFILES && !existsSync('/nix')) {
		return undefined
	}
	for (const bin of [
		'chromium',
		'chromium-browser',
		'google-chrome-stable',
		'google-chrome',
	]) {
		try {
			const found = execSync(`command -v ${bin}`, {
				stdio: ['ignore', 'pipe', 'ignore'],
			})
				.toString()
				.trim()
			if (found) return found
		} catch {
			// not on PATH; try the next candidate
		}
	}
	return undefined
}

const chromiumPath = resolveBrowserPath()

const WEB_PORT = process.env.E2E_WEB_PORT ?? '3100'
const WEB_URL = process.env.E2E_WEB_URL ?? `http://localhost:${WEB_PORT}`
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8787'

const repoRoot = path.resolve(import.meta.dirname, '../..')

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'list',
	use: {
		baseURL: WEB_URL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				...(chromiumPath
					? { launchOptions: { executablePath: chromiumPath } }
					: {}),
			},
		},
	],
	webServer: [
		{
			command: 'pnpm -F @polybin/api dev',
			url: API_URL,
			cwd: repoRoot,
			// keep the locally running server if it is already running
			reuseExistingServer: true,
			timeout: 120_000,
		},
		{
			// builds the static export and serves it through `wrangler pages dev`.
			// this is the only topology that can serve runtime `/pastes/<id>` ids without `generateStaticParams`.
			command: `pnpm -F @polybin/web build && wrangler pages dev apps/web/out --port ${WEB_PORT} --ip 127.0.0.1`,
			url: WEB_URL,
			cwd: repoRoot,
			// always rebuild so the served `out/` reflects current source.
			reuseExistingServer: false,
			timeout: 180_000,
		},
	],
})
