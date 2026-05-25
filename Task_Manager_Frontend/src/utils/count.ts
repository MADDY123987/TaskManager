export type CountLike = number | { count?: number } | null | undefined;

export function toCount(value: CountLike) {
  if (typeof value === 'number') return value;
  if (value && typeof value.count === 'number') return value.count;
  return 0;
}
