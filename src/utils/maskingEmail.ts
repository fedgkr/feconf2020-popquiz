import { toMask } from "./toMask";

export function maskingEmail(email: string) {
  const [id, domain] = email.split('@');
  const [first, second, third, ...middle] = id.split('');
  const idMaskTarget = middle.slice(0, middle.length - 1);
  const last = middle[middle.length - 1];

  const [firstDomain, secondDomain, ...domainMaskTarget] = domain.split('');

  return `${first}${second}${third}${toMask(idMaskTarget)}${last}@${firstDomain}${secondDomain}${toMask(domainMaskTarget)}`;
}
