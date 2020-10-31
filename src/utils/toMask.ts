export function toMask(target: string[]) {
  return target.map(() => '*').join('');
}
