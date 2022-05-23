import {diagnose, x} from '../library';

test('diagnose should work', () => {
  expect(
    diagnose(
      {
        foo: 'abc',
        bar: x.number,
      },
      {foo: 'abc', bar: 123},
      [],
    ),
  ).toEqual([]);
  expect(
    diagnose(
      {
        foo: ['abc'],
        bar: [x.number],
      },
      {foo: ['abc'], bar: [123]},
      [],
    ),
  ).toEqual([]);

  expect(
    diagnose(
      {
        foo: 'abc',
        bar: x.number,
      },

      {foo: 'abc', bar: 'def'},
      [],
    ),
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number, getting [object String].",
        "path": Array [
          "bar",
        ],
      },
    ]
  `);

  expect(
    diagnose(
      {
        foo: ['abc'],
        bar: [x.number],
      },

      {foo: ['abc'], bar: ['def']},
      [],
    ),
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Expected number, getting [object String].",
        "path": Array [
          "bar",
          0,
        ],
      },
    ]
  `);
});
