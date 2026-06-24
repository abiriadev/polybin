import { expect, test } from '@playwright/test'

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8787'

// Seed a paste straight through the API so view/raw tests don't depend on the
// (currently broken) create-via-UI flow. The API wraps payloads as
// `{ ok, message, data }`, so the real paste lives under `.data`.
async function seedPaste(
	request: import('@playwright/test').APIRequestContext,
	content: string,
) {
	const res = await request.post(`${API_URL}/api/pastes`, {
		data: { content },
	})
	expect(res.ok()).toBeTruthy()
	const body = await res.json()
	return body.data as { id: string; content: string }
}

test.describe('Polybin pastes', () => {
	test('create a new paste and get redirected to its page', async ({
		page,
	}) => {
		const content = `# Hello e2e ${Date.now()}`

		await page.goto('/')

		const editor = page.locator('.cm-content')
		await editor.click()
		await page.keyboard.type(content)

		await page.getByRole('button', { name: 'Paste' }).click()

		// Should land on the new paste's permalink, not /pastes/undefined.
		await expect(page).toHaveURL(/\/pastes\/[A-Za-z0-9]{6}$/)
		await expect(page.getByText('Hello e2e', { exact: false })).toBeVisible()
	})

	test('access and read an existing paste', async ({ page, request }) => {
		const content = `Existing paste body ${Date.now()}`
		const paste = await seedPaste(request, content)

		await page.goto(`/pastes/${paste.id}`)

		await expect(page.getByText(content)).toBeVisible()
		// The id is shown in the page heading.
		await expect(
			page.getByRole('heading', { name: paste.id }),
		).toBeVisible()
	})

	test('access the raw url of a paste', async ({ page, request }) => {
		const content = `Raw content ${Date.now()}`
		const paste = await seedPaste(request, content)

		// Expected raw endpoint: returns the paste content as plain text.
		// NOTE: not implemented yet — kept as a failing TDD spec.
		const response = await page.goto(`${API_URL}/api/pastes/${paste.id}/raw`)

		expect(response?.status()).toBe(200)
		expect(response?.headers()['content-type']).toContain('text/plain')
		await expect(page.getByText(content)).toBeVisible()
	})
})
