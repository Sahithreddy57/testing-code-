
import { test, expect, chromium } from '@playwright/test';

test('MechGo - Concurrent Login Page Load Test', async () => {

  const browser = await chromium.launch();

  const totalUsers = 10;

  const results = await Promise.all(
    Array.from({ length: totalUsers }, async (_, index) => {

      const context = await browser.newContext();
      const page = await context.newPage();

      const startTime = Date.now();

      try {
        const response = await page.goto(
          'https://mechgo.net/admin',
          { waitUntil: 'domcontentloaded' }
        );

        const loadTime = Date.now() - startTime;

        return {
          user: index + 1,
          status: response?.status(),
          responseTime: loadTime
        };

      } finally {
        await context.close();
      }
    })
  );

  console.log('Concurrent User Results:', results);

  const successfulUsers = results.filter(
    result => result.status === 200
  ).length;

  const failedUsers = totalUsers - successfulUsers;

  console.log('Total Users:', totalUsers);
  console.log('Successful Users:', successfulUsers);
  console.log('Failed Users:', failedUsers);

  await browser.close();

  expect(failedUsers).toBe(0);
});
