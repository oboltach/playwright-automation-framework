// pages/RegistrationPage.js
// Page Object for ParaBank Registration: https://parabank.parasoft.com/parabank/register.htm
// ESM module (matches your "type":"module" in package.json)


export default class RegistrationPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.urlPath = '/parabank/register.htm';

    // --- Form field locators (by name attributes used on ParaBank form) ---
    this.firstName     = page.locator('input[name="customer.firstName"]');
    this.lastName      = page.locator('input[name="customer.lastName"]');
    this.address       = page.locator('input[name="customer.address.street"]');
    this.city          = page.locator('input[name="customer.address.city"]');
    this.state         = page.locator('input[name="customer.address.state"]');
    this.zipCode       = page.locator('input[name="customer.address.zipCode"]');
    this.phone         = page.locator('input[name="customer.phoneNumber"]');
    this.ssn           = page.locator('input[name="customer.ssn"]');
    this.username      = page.locator('input[name="customer.username"]');
    this.password      = page.locator('input[name="customer.password"]');
    this.confirm       = page.locator('input[name="repeatedPassword"]');

    // Submit control (ParaBank uses an <input value="Register">)
    this.submitBtn     = page.locator('input[type="submit"][value="Register"]');

    // Success & error indicators (texts seen after submit)
    this.successBanner = page.getByText('Your account was created successfully', { exact: false });//happy path
    this.welcomeBanner = page.locator('h1.title'); // unique heading: "Welcome <username>"
    this.errorBanner   = page.locator('.error, .smallText'); // error path
  }

  /** Navigate to registration page. If baseURL is set in project, relative path works. */
  async goto() {
    await this.page.goto(this.urlPath);
  }

  async typeFirstName(name) {
    await this.firstName.fill(name);
  }

  async typeLastName(name) {
    await this.lastName.fill(name);
  }

  async typeAddress(address) {
    await this.address.fill(address);
  }

  async typeCity(city) {
    await this.city.fill(city);
  }

  async typeState(state) {
    await this.state.fill(state);
  }

  async typeZip(zip) {
    await this.zipCode.fill(zip);
  }

  async typePhone(phone) {
    await this.phone.fill(phone);
  }

  async typeSSN(ssn) {
    await this.ssn.fill(ssn);
  }

  async typeUsername(username) {
    await this.username.fill(username);
  }

  async typePassword(password) {
    await this.password.fill(password);
  }

  async typeConfirmPassword(password) {
    await this.confirm.fill(password);
  }

  async submit() {
    await this.submitBtn.click();
  }
}
