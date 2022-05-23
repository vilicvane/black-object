import {assertScriptsCompleted, call, createBlackObject, x} from '../library';

test('calls as scripts defined', () => {
  interface BlackObject {
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([x.equal(123)], true)],
  ]);

  expect(blackObject.foo()).toBe(undefined);
  expect(blackObject.bar(123)).toBe(true);

  assertScriptsCompleted(blackObject);
});

test('unexpected call', () => {
  interface BlackObject {
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([123], true)],
  ]);

  expect(blackObject.foo()).toBe(undefined);

  expect(() => blackObject.foo()).toThrowErrorMatchingInlineSnapshot(
    `"Unexpected script call foo, no pending scripts"`,
  );
});

test('unexpected call arguments', () => {
  interface BlackObject {
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([x.literal(123)], true)],
  ]);

  expect(blackObject.foo()).toBe(undefined);

  expect(() => blackObject.bar(456)).toThrowErrorMatchingInlineSnapshot(`
    "Unexpected parameters:
      [0] Unexpected value."
  `);
});

test('calls as scripts defined with fallback methods', () => {
  interface BlackObject {
    prop: string;
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>(
    {
      prop: 'abc',
      foo() {},
    },
    [
      ['bar', call([x.literal(123)], true)],
      ['bar', call([x.literal(456)], false)],
    ],
  );

  expect(blackObject.foo()).toBe(undefined);
  expect(blackObject.bar(123)).toBe(true);
  expect(blackObject.prop).toBe('abc');
  expect(blackObject.bar(456)).toBe(false);
  expect(blackObject.foo()).toBe(undefined);

  assertScriptsCompleted(blackObject);
});

test('repeated calls as scripts defined', () => {
  interface BlackObject {
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([x.literal(123)], true)],
    ['foo', call([])],
    ['bar', call([x.literal(456)], false)],
  ]);

  expect(blackObject.foo()).toBe(undefined);
  expect(blackObject.bar(123)).toBe(true);
  expect(blackObject.foo()).toBe(undefined);
  expect(blackObject.bar(456)).toBe(false);

  assertScriptsCompleted(blackObject);
});

test('unexpected repeated call arguments', () => {
  interface BlackObject {
    foo(): void;
    bar(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([x.literal(123)], true)],
    ['foo', call([])],
    ['bar', call([x.literal(456)], false)],
  ]);

  expect(blackObject.foo()).toBe(undefined);
  expect(blackObject.bar(123)).toBe(true);
  expect(blackObject.foo()).toBe(undefined);
  expect(() => blackObject.bar(123)).toThrowErrorMatchingInlineSnapshot(`
    "Unexpected parameters:
      [0] Unexpected value."
  `);
});

test('get before call', () => {
  interface BlackObject {
    foo?(): void;
    bar?(a: number): boolean;
  }

  let blackObject = createBlackObject<BlackObject>([
    ['foo', call([])],
    ['bar', call([x.literal(123)], true)],
    ['bar', call([x.literal(456)], false)],
  ]);

  expect(blackObject.foo && blackObject.foo()).toBe(undefined);
  expect(blackObject.bar && blackObject.bar(123)).toBe(true);
  expect(blackObject.bar && blackObject.bar(456)).toBe(false);

  assertScriptsCompleted(blackObject);
});
