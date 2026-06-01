// playwright/tests/api/booking.spec.js
import { test, expect } from '@playwright/test';
import {
  newApiContext,
  apiGet,
  apiPost,
  apiDelete,
  parseJson,
  expectStatus,
} from '../../utils/helpers.js';
import {
  buildRestfulBookerBooking,
  buildRestfulBookerAuth,
} from '../../utils/dataFactory.js';
import { expectBookingShape } from '../../utils/assertions.js';

test.describe('Negative Restful Booker API', () => {
  test('Bad request - 400', async () => {
    const baseURL = test.info().project.metadata.apiBaseUrl; //test.info()-Playwright built-in function that gives you metadata about the currently running test.
    // OR you can do const baseURL = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

    // Create an isolated API client bound to the API base URL
    const api = await newApiContext({ baseURL });

    // 1) Create a booking
    const badJson = '{"firstname": "Olga}';
    const res = await apiPost(api, '/booking', { headers: {'Content-Type': 'application/json'}, data: badJson});
    await expectStatus(res, 400);

    const text = await res.text();
    expect(text.trim()).toBe('Bad Request')
  });
// same test, another variation of initiating apiClient
  // The `request` fixture is an APIRequestContext — use it directly with the full URL.
  // It does not have newContext(); that lives on the module-level `request` (APIRequest).
  test('Bad request - 400 (request fixture)', async ({request}) => {
    const baseURL = test.info().project.metadata.apiBaseUrl;

    const badJson = '{"firstname": "Olga}';
    const res = await request.post(`${baseURL}/booking`, { headers: {'Content-Type': 'application/json'}, data: badJson});
    await expectStatus(res, 400);

    const text = await res.text();
    expect(text.trim()).toBe('Bad Request')
  });

  test('Internal Server error - 500', async () => {
    const baseURL = test.info().project.metadata.apiBaseUrl; //test.info()-Playwright built-in function that gives you metadata about the currently running test.
    // OR you can do const baseURL = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

    // Create an isolated API client bound to the API base URL
    const api = await newApiContext({ baseURL });


    const missingField = '{"firstname": "Olga"}';
    const res = await apiPost(api, '/booking', { headers: {'Content-Type': 'application/json'}, data: missingField});
    await expectStatus(res, 500);

    const text = await res.text();
    expect(text.trim()).toMatch(/internal server error/i)
  });

  test('Not Found - 404', async () => {
    const baseURL = test.info().project.metadata.apiBaseUrl; //test.info()-Playwright built-in function that gives you metadata about the currently running test.
    // OR you can do const baseURL = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

    // Create an isolated API client bound to the API base URL
    const api = await newApiContext({ baseURL });

    const res = await apiGet(api, '/booking/2345678976');
    await expectStatus(res, 404);

    const text = await res.text();
    expect(text.trim()).toMatch(/not found/i)
  });

  test('Forbidden - 403', async () => {
    const baseURL = test.info().project.metadata.apiBaseUrl; //test.info()-Playwright built-in function that gives you metadata about the currently running test.
    // OR you can do const baseURL = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

    // Create an isolated API client bound to the API base URL
    const api = await newApiContext({ baseURL });

    const res = await apiDelete(api, '/booking/1', {headers: {'Content-Type': 'application/json', 'Cookie': 'token=abc123'}});
    await expectStatus(res, 403);

    const text = await res.text();
    expect(text.trim()).toMatch(/forbidden/i)
  });
});
