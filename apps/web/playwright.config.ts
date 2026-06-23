import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:3000'
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
				// nixos patch
				...(process.env.PLAYWRIGHT_CHROMIUM_PATH
					? {
							launchOptions: {
								executablePath:
									process.env.PLAYWRIGHT_CHROMIUM_PATH,
							},
						}
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
			command: 'pnpm -F @polybin/web dev',
			url: WEB_URL,
			cwd: repoRoot,
			reuseExistingServer: true,
			timeout: 120_000,
		},
	],
})
