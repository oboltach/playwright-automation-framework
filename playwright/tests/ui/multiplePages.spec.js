import { test } from '@playwright/test';
import MultiPage from '../../pages/MultiPage.js';
import {expectNewTabTitle} from '../../utils/assertions.js';

test.describe('Multipage flow', () => {

  test('successful case', async ({ page }) => {
    const multipage = new MultiPage(page);

    // Fill the form with generated user data
    await multipage.goto();
    const popup = await multipage.openNewWindow()


    // Assertion via Page Object
    await expectNewTabTitle(popup, 'New Window');
  });
});
