import {
  assertScriptsCompleted,
  createBlackObject,
  get,
  property,
  set,
  x,
} from '../library';

test('property as scripts defined', () => {
  interface BlackObject {
    foo: string;
  }

  let blackObject = createBlackObject<BlackObject>({foo: 'def'}, [
    ['foo', get('')],
    ['foo', set(x.literal('abc'))],
    ['foo', property('ghi')],
  ]);

  expect(blackObject.foo).toBe('');
  blackObject.foo = 'abc';
  expect(blackObject.foo).toBe('ghi');
  expect(blackObject.foo).toBe('ghi');

  assertScriptsCompleted(blackObject);
});
