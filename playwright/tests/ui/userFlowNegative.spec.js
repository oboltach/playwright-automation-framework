import { test } from '@playwright/test';
import RegistrationPage from '../../pages/RegistrationPage.js';
import LoginPage from '../../pages/LoginPage.js';
import { buildParaBankUser } from '../../utils/dataFactory.js';
import { expectRegErrorVisible, expectLoginErrorVisible } from '../../utils/assertions.js';

test.describe('ParaBank auth negative', () => {

  test('unsuccessful registration', async ({ page }) => {
    const regPage = new RegistrationPage(page);

    // Use your dataFactory to generate a user
    const createdUser = buildParaBankUser({password:'123', confirm: '111'});

    // Fill the form with generated user data
    await regPage.goto();
    await regPage.typeFirstName(createdUser.firstName);
    await regPage.typeLastName(createdUser.lastName);
    await regPage.typeAddress(createdUser.address);
    await regPage.typeCity(createdUser.city);
    await regPage.typeState(createdUser.state);
    await regPage.typeZip(createdUser.zipCode);
    await regPage.typePhone(createdUser.phone);
    await regPage.typeSSN(createdUser.ssn);
    await regPage.typeUsername(createdUser.username);
    await regPage.typePassword(createdUser.password);
    await regPage.typeConfirmPassword(createdUser.confirm);
    await regPage.submit();

    // Assertion via Page Object
    await expectRegErrorVisible(regPage);
  });
  test('unsuccessful login', async ({page}) => {
    const loginPage = new LoginPage(page);

    // ParaBank's demo accepts any non-empty credentials (logs in as the demo account).
    // Submitting empty fields hits the one validation path the server actually enforces.
    await loginPage.goto();
    await loginPage.submit();

    // Assertion via Page Object
    await expectLoginErrorVisible(loginPage);
  });
});
