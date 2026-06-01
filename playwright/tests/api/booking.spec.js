// playwright/tests/api/booking.spec.js
import { test, expect } from '@playwright/test';
import {
  newApiContext,
  apiGet,
  apiPost,
  apiDelete,
  parseJson,
  expectStatus,
} from '../../utils/helpers.js';
import {
  buildRestfulBookerBooking,
  buildRestfulBookerAuth,
} from '../../utils/dataFactory.js';
import { expectBookingShape } from '../../utils/assertions.js';

test.describe('Restful Booker API', () => {
  test('create booking → verify → delete', async () => {
    const baseURL = test.info().project.metadata.apiBaseUrl; //test.info()-Playwright built-in function that gives you metadata about the currently running test.
    // OR you can do const baseURL = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

    // Create an isolated API client bound to the API base URL
    const api = await newApiContext({ baseURL });

    // 1) Create a booking
    const payload = buildRestfulBookerBooking();
    const createRes = await apiPost(api, '/booking', { data: payload });
    await expectStatus(createRes, 200);

    const created = await parseJson(createRes);
    expect(created.bookingid, 'bookingid missing').toBeTruthy();// expect takes two param, actual result and optional error message if it fails
    expectBookingShape(created.booking);

    // 2) Fetch the booking by id and validate shape
    const getRes = await apiGet(api, `/booking/${created.bookingid}`);
    await expectStatus(getRes, 200);
    const fetched = await parseJson(getRes);
    expectBookingShape(fetched);

    // 3) Auth and delete the booking (cleanup)
    const authRes = await apiPost(api, '/auth', { data: buildRestfulBookerAuth() });
    await expectStatus(authRes, 200);
    const { token } = await parseJson(authRes);

    const delRes = await apiDelete(api, `/booking/${created.bookingid}`, {
      headers: { Cookie: `token=${token}` },
    });
    // Restful-Booker returns 201 for successful DELETE
    await expectStatus(delRes, 201);
  });
});
