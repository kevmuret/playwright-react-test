export function normalizeArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}
