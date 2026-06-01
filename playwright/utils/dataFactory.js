// utils/dataFactory.js
// Data builders for ParaBank (UI) and ReqRes (API).
// No external deps. Works with your existing randomEmail() helper.

// If you prefer not to import from helpers.js, you can inline a tiny random helper here.
import { randomEmail } from './helpers.js';

/* ----------------------------- Generic helpers ----------------------------- */

// Generate a short random alphanumeric string.
// - `len` = how many characters you want (default = 6).
function rand(len = 6) {
  // Math.random() → 0.xxx
  // .toString(36) → "0.q3g5kz..."
  // .slice(2, 2 + len) → skip "0." and take `len` characters
  return Math.random().toString(36).slice(2, 2 + len);
}

// Generate a random username string.
// - `prefix` = optional string to prepend (default = "user").
// - Appends "_" + 6 random alphanumeric characters from rand().
// Example: "user_q3g5kz" or "olga_ab12cd".
export function randomUsername(prefix = 'user'){
  return `${prefix}_${rand(6)}`;
}

// Generate random date in YYYY-MM-DD between start and end
export function randomDate(start = new Date(2018, 0, 1), end = new Date()) {
  //Start from the beginning date, then jump forward by a random number of milliseconds, but never beyond the end date.
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  //Turn the random timestamp into a Date, write it as an ISO string, cut off everything after the T, and keep just the YYYY-MM-DD date
  return new Date(timestamp).toISOString().split('T')[0];
}

// Generate a fake but valid-looking 10-digit US phone number. Always starts with "555" (a reserved/test area code).
// - Then appends 7 random digits. Math.random() → random decimal [0, 1)
//   * 9000000     → scales it to [0 … 8,999,999]    + 1000000     → shifts range to [1,000,000 … 9,999,999]
//   Math.floor()  → ensures a whole integer (exactly 7 digits) Example output: "5551234567", "5559876543"
export function randomPhone() {
  return `555${Math.floor(1000000 + Math.random() * 9000000)}`;
}

// Generate a random 5-digit US ZIP code. Math.random() → random decimal [0, 1)
// - * 90000       → scales it to [0 … 89,999]  - + 10000       → shifts range to [10,000 … 99,999]
// - Math.floor()  → ensures a whole integer Result is always exactly 5 digits. Example output: 94123, 10045, 99999
export function randomZip() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

// Generate a fake but realistic-looking US Social Security Number (SSN). Format: "AAA-GG-SSSS"
// - First part (AAA): 3 digits, 100–999  - Second part (GG): 2 digits, 10–99 - Third part (SSSS): 4 digits, 1000–9999
// Uses template literals (`${...}`) to embed numbers and "-" separators
// directly into a single string. Example output: "123-45-6789"
export function randomSSN() {
  return `${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ------------------------------- ParaBank UI ------------------------------- */
// Build a fake but valid-looking ParaBank user payload for registration tests.
// Provides default values for all required fields (name, address, credentials).Uses helpers (randomZip, randomPhone, randomSSN, randomUsername)
// to ensure uniqueness and realistic formats for dynamic fields.
// Allows overriding any field by passing an `overrides` object. Example: buildParaBankUser({ firstName: 'Anna', password: 'Secret123' })
// will return the base object but replace `firstName` and `password`.
// Default fields: firstName: "Olga" lastName: "QA_<random>"  → adds uniqueness address/city/state: static test values
// zipCode, phone, ssn: realistic random values via helpers username: random unique username (prefix "olga") password/confirm: static strong test password
export function buildParaBankUser(overrides = {}) {
  const base = {
    firstName: 'Olga',
    lastName: `QA_${rand(4)}`,
    address: '123 Test St',
    city: 'Testville',
    state: 'CA',
    zipCode: randomZip(),
    phone: randomPhone(),
    ssn: randomSSN(),               // dummy but realistic format
    username: randomUsername('olga'),
    password: 'Password!23',
    confirm: 'Password!23'
  };
//First, all properties from base are copied. Then, all properties from overrides are copied on top. If a key exists in both, the one from overrides replaces the one from base.
  return { ...base, ...overrides };
}

// Build a ParaBank login payload. Function parameter uses object destructuring: expects a single object with optional { username, password } keys.
// Example: buildParaBankLogin({ username: 'anna', password: 'Secret123' }) The "= {}" default ensures it won’t break if no object is passed.
export function buildParaBankLogin({ username, password } = {}) {
  // Returns: { username, password }
  return {
    username: username ?? randomUsername('olga'),// Uses nullish coalescing - username ?? randomUsername('olga') → use given username, or generate one if null/undefined
    password: password ?? 'Password!23' //password ?? 'Password!23'          → use given password, or default if null/undefined
  };
}

/* -------------------------------- Restful Booker API ------------------------------- */

// Build the auth payload for Restful Booker POST /auth.Always returns the required static credentials: { username: "admin", password: "password123" }.
// Supports optional overrides, useful for negative tests (e.g. wrong password, missing field). The spread operator merges any overrides passed in
// Example: buildReqresCreateUser({ password: 'Secret123' }) will replace the default password but keep random username/email.
// Returns: an object ready to send in the body of an auth request.
export function buildRestfulBookerAuth(overrides = {}) {
  const base = {
    username: 'admin',
    password: 'password123'
  };
  return { ...base, ...overrides };
}

// Factory for Restful Booker POST /booking payload. Generates realistic booking data with randomized but valid dates.
// - Check-in: random date between Jan 2024 and Jan 2025; Checkout: calculated by adding 1–7 nights to check-in
// - Ensures date format is always YYYY-MM-DD (ISO date string)
// - Provides defaults for required fields (firstname, lastname, totalprice, etc.) Supports overrides so tests can customize any field
//   Example: buildRestfulBookerBooking({ totalprice: 500, additionalneeds: "Dinner" })
export function buildRestfulBookerBooking(overrides = {}) {
  const checkin = randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1)); // use randomDate fn to pick a random check-in date between Jan 2024 and Jan 2025
  const ci = new Date(checkin); //// Convert check-in string (YYYY-MM-DD) into a Date object so we can add days
  const nights = 1 + Math.floor(Math.random() * 7);   // Randomly choose booking length: 1–7 nights for realism
  const co = new Date(ci); // Clone the check-in date so we can adjust it without mutating the original
  co.setDate(ci.getDate() + nights);   // Add the number of nights to check-in to calculate check-out date
  const checkout = co.toISOString().split('T')[0];   // Format checkout as YYYY-MM-DD string (ISO format without time)
  const base = {
    firstname: 'Olga',
    lastname: `QA_${rand(4)}`,
    totalprice: 111,
    depositpaid: true,
    bookingdates: {checkin, checkout},
    additionalneeds: 'Breakfast'
  };
  return { ...base, ...overrides };
}


/* ------------------------------ Convenience sets --------------------------- */
// Factory for creating a ParaBank account + login set.
// Combines two related payloads in one call: • user → full registration payload  • login → minimal credentials object { username, password }
// - Useful when a test needs both registration data and a matching login flow.
// - Supports overrides: fields passed in will override defaults in buildParaBankUser. Example: buildParaBankAccountSet({ firstname: "Anna" })
//   → returns { user: { ...full user payload... }, login: { username, password } }
export function buildParaBankAccountSet(overrides = {}) {
  const user = buildParaBankUser(overrides);
  const login = { username: user.username, password: user.password };
  return { user, login };
}
