export default class MultiPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    //we set baseUrl because by default it uses parabank as baseURL (from playwrightconfig.js).
    //We use || in case we set env.BASE_URL_HEROKUAPP to smth not https://the-internet.herokuapp.com, but some staging env
    this.baseURL = process.env.BASE_URL_HEROKUAPP || 'https://the-internet.herokuapp.com'
    this.urlPath = '/windows';

    // - Link and Header at this window page
    this.clickHereLink = page.getByRole('link', {name: 'Click Here'});
    this.exampleHeader = page.locator('h3');
  }

  /** Navigate directly to window page */
  async goto() {
    await this.page.goto(`${this.baseURL}${this.urlPath}`);
  }

  async openNewWindow() {
    // Clicks the link and waits for the popup, returning the new Page object
    const [newPage] = await Promise.all([   //Take the first value from the array returned by Promise.all and put it in a variable called newPage.
      this.page.waitForEvent('popup'),
      this.clickHereLink.click()
    ]);
    return newPage;
  }
}
