import { test } from '@playwright/test';
import RegistrationPage from '../../pages/RegistrationPage.js';
import LoginPage from '../../pages/LoginPage.js';
import { buildParaBankUser} from '../../utils/dataFactory.js';
import { expectRegistrationSuccess, expectLoginSuccess } from '../../utils/assertions.js';

test.describe.serial('ParaBank auth', () => {
  let createdUser;

  test('successful registration', async ({ page }) => {
    //we create a new page object here
    const regPage = new RegistrationPage(page);

    // Use your dataFactory to generate a user
    createdUser = buildParaBankUser();

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
    await expectRegistrationSuccess(regPage, createdUser.username);
  });
  test('successful login', async ({page}) => {
    const loginPage = new LoginPage(page);

    // Fill the form with generated user data
    await loginPage.goto();
    await loginPage.typeUsername(createdUser.username);
    await loginPage.typePassword(createdUser.password);
    await loginPage.submit();
    // Assertion via Page Object
    await expectLoginSuccess(loginPage);
  });
});
