// pages/LoginPage.js
// Page Object for ParaBank Login: https://parabank.parasoft.com/parabank/index.htm

export default class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.urlPath = '/parabank/index.htm';

    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.loginBtn = page.locator('input[type="submit"][value="Log In"]');
    this.errorBanner = page.locator('.error');
    this.accountOverviewLink = page.getByRole('link', { name: 'Accounts Overview' });
  }

  async goto() {
    await this.page.goto(this.urlPath);
  }

  async logout() {
    await this.page.goto('/parabank/logout.htm');
  }

  async typeUsername(username) {
    await this.username.fill(username);
  }

  async typePassword(password) {
    await this.password.fill(password);
  }

  async submit() {
    await this.loginBtn.click();
  }
}
