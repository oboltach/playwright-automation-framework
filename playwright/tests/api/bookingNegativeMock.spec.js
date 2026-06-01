import { test, expect } from '@playwright/test';
import { buildRestfulBookerBooking } from '../../utils/dataFactory.js';
import { mockError, mockDelay, spyApi } from '../../utils/mockHelpers.js';

// page.route() only intercepts browser-originated requests (fetch/XHR from inside the page).
// page.request.* calls go through a Node.js-side APIRequestContext that bypasses routing.
// We use page.evaluate() to run fetch() inside the browser so interception works.
async function browserFetch(page, url, { method = 'GET', payload = null } = {}) {
  return page.evaluate(async ({ url, method, payload }) => {
    const init = { method, headers: { 'Content-Type': 'application/json' } };
    if (payload !== null) init.body = JSON.stringify(payload);
    const res = await fetch(url, init);
    let body = null;
    try { body = await res.json(); } catch {}
    return { status: res.status, body };
  }, { url, method, payload });
}

test.describe('Negative Restful Booker API', () => {

  test.beforeEach(async ({ page }) => {
    // Provide a browser context so page.route() has a page to attach to
    await page.goto('about:blank');
  });

  test('Bad request - 400', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    await mockError(page, endpoint, 400, 'Bad request');
    const badType = buildRestfulBookerBooking({ totalprice: 'not-a-number' });
    const result = await browserFetch(page, endpoint, { method: 'POST', payload: badType });

    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/bad request/i);
  });

  test('Bad Gateway - 502', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    await mockError(page, endpoint, 502, 'Bad Gateway');
    const payload = buildRestfulBookerBooking();
    const result = await browserFetch(page, endpoint, { method: 'POST', payload });

    expect(result.status).toBe(502);
    expect(result.body.error).toMatch(/bad gateway/i);
  });

  test('Service unavailable - 503', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    await mockError(page, endpoint, 503, 'Service Unavailable');
    const payload = buildRestfulBookerBooking();
    const result = await browserFetch(page, endpoint, { method: 'POST', payload });

    expect(result.status).toBe(503);
    expect(result.body.error).toMatch(/service unavailable/i);
  });

  test('Too Many requests - 429', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    await page.route(endpoint, route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: { 'Retry-After': '30' },
        body: JSON.stringify({ error: 'Too Many Requests' })
      });
    });
    const payload = buildRestfulBookerBooking();
    const result = await browserFetch(page, endpoint, { method: 'POST', payload });

    expect(result.status).toBe(429);
    expect(result.body.error).toMatch(/too many requests/i);
  });

  test('API delayed response - mock 2s', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    await mockDelay(page, endpoint, 2000, { message: 'slow response' });
    const start = Date.now();
    const result = await browserFetch(page, endpoint);
    const elapsed = Date.now() - start;

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('slow response');
    expect(elapsed).toBeGreaterThanOrEqual(1900);
  });

  test('Spy on booking creation request', async ({ page }) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;
    const endpoint = `${baseURL}/booking`;

    // route.continue() fails from about:blank (CORS blocks real cross-origin calls).
    // Capture the request data inside the route handler, then fulfill with a mock
    // response — the spy goal is to inspect what was sent, not the real server response.
    let captured = {};
    await page.route(endpoint, (route) => {
      const req = route.request();
      captured = {
        method: req.method(),
        headers: req.headers(),
        postData: req.postData()
      };
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bookingid: 1 })
      });
    });

    const payload = buildRestfulBookerBooking({ firstname: 'Olga' });
    const result = await browserFetch(page, endpoint, { method: 'POST', payload });

    expect(result.status).toBe(200);
    expect(captured.method).toBe('POST');
    expect(captured.headers['content-type']).toContain('application/json');
    const sentBody = JSON.parse(captured.postData);
    expect(sentBody.firstname).toBe('Olga');
  });
});
