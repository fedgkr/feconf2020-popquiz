import { maskingEmail } from '../index';

test('maskingEmail', () => {
  const email = "feconf.kr@gmail.com";
  const result = maskingEmail(email);

  expect(result).toBe("fec*****r@gm*******");
});
