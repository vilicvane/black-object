import {
  assertScriptsCompleted,
  createBlackObject,
  get,
  set,
  x,
} from '../library';

test('gets and sets as scripts defined', () => {
  interface BlackObject {
    foo: string;
    bar: number;
  }

  let blackObject = createBlackObject<BlackObject>({foo: 'def'}, [
    ['foo', get('')],
    ['foo', set('abc')],
    ['bar', get(1)],
  ]);

  expect(blackObject.foo).toBe('');
  blackObject.foo = 'abc';
  expect(blackObject.foo).toBe('def');

  expect(blackObject.bar).toBe(1);

  assertScriptsCompleted(blackObject);
});

test('gets and sets with unmatched type', () => {
  interface BlackObject {
    foo: string;
  }

  let blackObject = createBlackObject<BlackObject>({foo: 'def'}, [
    ['foo', get('')],
    ['foo', set(x.equal('abc'))],
  ]);

  expect(blackObject.foo).toBe('');

  expect(() => {
    blackObject.foo = 'def';
  }).toThrowErrorMatchingInlineSnapshot(`
    "Value does not satisfy the type:
      Unexpected value."
  `);
});
