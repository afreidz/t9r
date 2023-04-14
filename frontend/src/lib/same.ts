export default function same<T extends {}>(p1: T, p2: { [key: string]: unknown } | null) {
  if (!p2) return false;
  const p1k = Object.keys(p1);
  const p2k = Object.keys(p2);

  if (p1k.length === p2k.length) {
    return p1k.every((k) => p2.hasOwnProperty(k) && p2[k] === p1[k as keyof T]);
  }
  return false;
}
