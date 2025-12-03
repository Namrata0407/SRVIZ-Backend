declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function expect<T = any>(actual: T): {
    toBe(expected: T): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toEqual(expected: T): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeNull(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(item: any): void;
    toMatch(regexp: RegExp | string): void;
    toThrow(error?: string | RegExp | Error | typeof Error): void;
    not: {
      toBe(expected: T): void;
      toEqual(expected: T): void;
      toBeDefined(): void;
      toBeUndefined(): void;
      toBeNull(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toContain(item: any): void;
      toMatch(regexp: RegExp | string): void;
      toThrow(error?: string | RegExp | Error | typeof Error): void;
    };
  };
}

export {};

