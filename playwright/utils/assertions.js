// utils/assertions.js
import { expect } from '@playwright/test';
import RegistrationPage from '../pages/RegistrationPage.js';

/* ------------------- UI Assertions: ParaBank ------------------- */

// Verify registration success

export async function expectRegistrationSuccess(regPage, username) {
  await expect(regPage.welcomeBanner).toContainText(`Welcome ${username}`);
  await expect(regPage.successBanner).toContainText('Your account was created successfully');
}

// Verify login success
export async function expectLoginSuccess(loginPage) {
  await expect(loginPage.accountOverviewLink).toBeVisible();
}

// Verify error message on failed login/registration
export async function expectRegErrorVisible(regPage) {
  await expect(regPage.errorBanner).toBeVisible();
}
export async function expectLoginErrorVisible(loginPage) {
  await expect(loginPage.errorBanner).toBeVisible();
  await expect(loginPage.accountOverviewLink).not.toBeVisible();
}

/* ------------------- Multi-Tab Assertions: Herokuapp ------------------- */

// Verify that a new tab opens with correct heading
export async function expectNewTabTitle(popupPage, expected = 'New Window') {
  await expect(popupPage.locator('h3')).toHaveText(expected);
}

/* ------------------- API Assertions: Restful Booker ------------------- */

// Validate booking object shape
export function expectBookingShape(b) {
  expect(typeof b.firstname).toBe('string');
  expect(typeof b.lastname).toBe('string');
  expect(typeof b.totalprice).toBe('number');
  expect(typeof b.depositpaid).toBe('boolean');
  expect(typeof b.bookingdates).toBe('object');
  expect(typeof b.bookingdates.checkin).toBe('string');
  expect(typeof b.bookingdates.checkout).toBe('string');
}

// Quick status assertion for API responses
export async function expectHttpStatus(res, status) {
  expect(res.status(), `Expected ${status}, got ${res.status()}`).toBe(status);
}
