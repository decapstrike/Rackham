export type Fraction = { n: number; d: number };

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}

export function simplify(fraction: Fraction): Fraction {
  const sign = fraction.d < 0 ? -1 : 1;
  const g = gcd(fraction.n, fraction.d);
  return { n: sign * fraction.n / g, d: sign * fraction.d / g };
}

export function fractionToString(fraction: Fraction): string {
  const f = simplify(fraction);
  return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`;
}

export function parseFraction(value: string): Fraction | null {
  const normalized = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    const num = Number(normalized);
    if (Number.isInteger(num)) return { n: num, d: 1 };
    const places = normalized.split(".")[1]?.length ?? 0;
    return simplify({ n: Math.round(num * 10 ** places), d: 10 ** places });
  }
  const match = normalized.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!match) return null;
  const d = Number(match[2]);
  if (d === 0) return null;
  return simplify({ n: Number(match[1]), d });
}

export function equivalentFractions(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}
