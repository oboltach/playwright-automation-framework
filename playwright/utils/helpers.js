// utils/helpers.js
import { request, expect } from '@playwright/test';

// Creates a new isolated API client (APIRequestContext) with a base URL, headers, and timeout.
// Useful for API tests so you don’t repeat request.newContext() setup in every test.
// Defines 3 parameters (baseURL, headers, timeout) and returns a new isolated APIRequestContext.
export async function newApiContext({
  baseURL,
  headers = {},
  timeout = 15_000, // per-request timeout
} = {}) {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: headers,
    timeout,
  });
}

// Builds an Authorization header object for API requests.
// If a token is provided, returns { Authorization: "Bearer <token>" }, otherwise returns an empty object.
export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Retry wrapper for API calls with exponential backoff.
 * Takes 5 parameters: api client, http method, url, request options, retry options.
 */
export async function fetchWithRetry(
  api,                       // APIRequestContext (from request.newContext)
  method,                    // 'get' | 'post' | 'put' | 'delete' (string)
  url,                       // endpoint path or full URL
  { data, headers } = {},    // per-call payload + headers
  {
    retries = 2, // max number of retries
    retryOn = [429, 500, 502, 503, 504], // status codes to retry on
    baseDelayMs = 300, // starting delay (ms) for backoff
  } = {}
) {
  // Track how many attempts we’ve made
  let attempt = 0;
  // Store the most recent response
  let lastRes;
  // Loop until we either succeed or exhaust retries
  while (attempt <= retries) {
    // dynamic method dispatch: api['post'](...) == api.post(...)
    // eslint-disable-next-line no-await-in-loop
    const res = await api[method](url, { data, headers });
    lastRes = res;

    // If response is not in retryOn list, return it immediately (success or non-retryable error)
    if (!retryOn.includes(res.status())) {
      return res; // success or non-retryable error
    }
    // If we already used up all retries, break out of the loop
    if (attempt === retries) break;

    // Otherwise calculate exponential delay (300, 600, 1200, …)
    const delay = baseDelayMs * Math.pow(2, attempt); // 300, 600, 1200...
    // Pause for that delay before retrying
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, delay));
    // Increase attempt counter and try again
    attempt += 1;
  }
  // Return the last response if retries were exhausted
  return lastRes;
}

// Convenience wrappers around fetchWithRetry.
// They remove the need to pass the HTTP method as a parameter,
// making calls shorter, clearer, and less error-prone.
export function apiGet(api, url, opts, retryOpts) {
  return fetchWithRetry(api, 'get',    url, opts, retryOpts);
 }
export function apiPost(api, url, opts, retryOpts)   { return fetchWithRetry(api, 'post',   url, opts, retryOpts); }
export function apiPut(api, url, opts, retryOpts)    { return fetchWithRetry(api, 'put',    url, opts, retryOpts); }
export function apiDelete(api, url, opts, retryOpts) { return fetchWithRetry(api, 'delete', url, opts, retryOpts); }

// Safely convert a Playwright Response into JSON.
// Reads the body as text, attempts JSON.parse(), and if parsing fails
// throws a clear error showing the status code and a snippet of the body.
export async function parseJson(res) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`Failed to parse JSON (status ${res.status()}): ${txt?.slice(0, 300)}`);
  }
}

// Assert that a Response has the expected status code.
// On failure, include the response body in the error message for easier debugging.
export async function expectStatus(res, expected) {
  // Extract the actual status code
  const status = res.status();
  // Compare against expected; if mismatch, show status + body in error
  expect(status, `Unexpected status.\nBody: ${await res.text()}`).toBe(expected);// Build a detailed error message: static text+newline+full response body
}

// Generate a unique, random-looking email address for tests.
export function randomEmail(prefix = 'qa') {
  // Create a 6-character random string from numbers/letters
  const id = Math.random().toString(36).slice(2, 8);
  // Combine prefix + random id + fixed domain
  return `${prefix}_${id}@example.com`;
}

// Build a simple user payload object for API tests.
// Defaults: name='Olga', job='QA Lead'.
// Can override values by passing an object: userPayload({ name: 'Alice' }).
export function userPayload({ name = 'Olga', job = 'QA Lead' } = {}) {
  return { name, job };
}
