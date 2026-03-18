import { test, expect } from '@playwright/test';

test.describe('ML Bridge Data Integrity', () => {
  test('Alaska should fetch live ML score and display "Back to Global View"', async ({ page }) => {
    // 1. Navigate to the AuroraLens frontend
    await page.goto('/');

    // 2. Set up API intercept to ensure it hits the backend correctly
    const forecastResponsePromise = page.waitForResponse(
      response => response.url().includes('http://localhost:8000/api/weather/forecast/global') && response.status() === 200
    );

    // 3. Trigger the location lookup for Alaska
    const searchInput = page.getByPlaceholder('Search any location on Earth...');
    await searchInput.fill('Alaska');

    // 4. Click the search result to trigger zoomToLocation
    const alaskaOption = page.getByText('Alaska', { exact: true }).first();
    await alaskaOption.waitFor({ state: 'visible', timeout: 5000 });
    await alaskaOption.click();

    // 5. Await the specific Fast API response resolving the ML Bridge
    const forecastResponse = await forecastResponsePromise;
    const json = await forecastResponse.json();
    
    // Assert the backend returned valid logic
    expect(json.aurora_score).toBeDefined();
    expect(json.aurora_score).not.toBe(0);
    expect(json.aurora_score).not.toBe(37);

    // 6. Assert UI elements rendered
    // The Back to Global button
    const backBtn = page.getByRole('button', { name: /Back to Global View/i });
    await expect(backBtn).toBeVisible({ timeout: 10000 });

    // The ML Score displaying correctly
    const scoreText = page.locator('.text-5xl.font-black.text-white.orbitron');
    await expect(scoreText).toBeVisible({ timeout: 10000 });

    const displayedScore = await scoreText.textContent();
    expect(displayedScore).not.toBe('0');
    expect(displayedScore).not.toBe('37');

    // 7. Test the UI fixes: Reset the view to standard map bounds
    await backBtn.click();
    await expect(backBtn).not.toBeVisible();
  });
});
