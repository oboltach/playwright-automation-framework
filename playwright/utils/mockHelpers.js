// Mock an API endpoint by intercepting requests and returning fake data.
export async function mockApi(page, url, status = 200, body = {}) {
  // page.route() takes 2 params:
  //   1. url → the request pattern to intercept (string, glob, or regex)
  //   2. handler (callback) → runs for each match, gets a `route` object
  await page.route(url, route =>
    // In the handler, we decide how to respond instead of calling the real server:
    route.fulfill({
      status,                           // HTTP status code (default 200)
      contentType: 'application/json',  // tell browser it's JSON
      body: JSON.stringify(body),       // convert provided object into JSON string
    })
  );
}
// Mock an API endpoint to simulate a failure response.
// Returns the given status (default 500) and a JSON error message.
export async function mockError(page, url, status = 500, message = 'Internal Server Error') {
  // Intercept the request
  await page.route(url, route =>
    // Fulfill it with an error response
    route.fulfill({
      status,                           // e.g. 500, 404, 401
      contentType: 'application/json',  // still return JSON
      body: JSON.stringify({ error: message }), // error payload
    })
  );
}
// Mock an API response but delay it by N milliseconds before returning.
// Uses Promise + setTimeout so we can `await` and actually pause execution.
// Without wrapping setTimeout in a Promise, the function would continue immediately.
// Useful for testing frontend loading states, spinners, and timeouts.
export async function mockDelay(page, url, delayMs = 1000, body = {}) {
  await page.route(url, async route => {
    // Wait for the specified delay
    await new Promise(r => setTimeout(r, delayMs));

    // Then fulfill with a fake success response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}
// Spy on requests: capture and inspect what the frontend sends,
// but still let them hit the real backend (response is untouched).
// Useful for verifying request method, URL, headers, or body payload.
export async function spyApi(page, url, callback) { //The `callback` parameter is a function you provide that receives the intercepted request object
// so you can log it, assert on it, or store it for later use in your test.
  // Intercept matching requests
  await page.route(url, async route => {
    // Access the original request object (URL, method, headers, body)
    const request = route.request();

    // If a callback is provided, run it with the request (e.g., log or assert)
    if (callback) callback(request);

    // Let the request continue to the real backend
    await route.continue();
  });
}
