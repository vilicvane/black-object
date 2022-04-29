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
    ['foo', set(x.literal('abc'))],
    ['bar', get(1)],
  ]);

  expect(blackObject.foo).toBe('');
  blackObject.foo = 'abc';
  expect(blackObject.foo).toBe('def');

  expect(blackObject.bar).toBe(1);

  assertScriptsCompleted(blackObject);
});
