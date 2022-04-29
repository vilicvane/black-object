[![NPM version](https://img.shields.io/npm/v/black-object?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/black-object)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/black-object?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT license](https://img.shields.io/github/license/vilic/black-object?style=flat-square)](./LICENSE)

# Black Object

Black Object is simple utility for creating a mock object with predefined interaction "scripts" (`call`, `get`, `set` and `property` update).

## Installation

```sh
npm install black-object
# or
yarn add black-object
```

## Usage

```ts
import {assertScriptsCompleted, call, createBlackObject, x} from 'black-object';

interface Adapter {
  stepOne(): void;
  stepTwo(value: string): boolean;
}

const adapter = createBlackObject<Adapter>([
  ['stepOne', call([])],
  ['stepTwo', call([x.string], true)],
]);

// Error would be thrown if the following interactions failed to match the
// scripts defined above.

adapter.stepOne();
adapter.stepTwo('abc'); // true

assertScriptsCompleted(adapter);
```

### Create Black Object with fallback partial

```ts
const object = createBlackObject(
  {
    value: 123,
  },
  [
    ['foo', call([])],
    ['bar', call([x.number], value => value + 1)],
  ],
);

object.value; // 123

object.foo();
object.bar(0); // 1

object.value; // 123
```

### Property `get` and `set`

Both `get` and `set` script work only once and does not change the property value.

```ts
const object = createBlackObject([
  ['foo', get(123)],
  ['foo', set(456)],
]);

object.foo; // 123
object.foo = 456;
```

### Update `property`

```ts
const object = createBlackObject(
  {
    foo: 123,
  },
  [
    ['foo', set(x.number)],
    ['foo', property(456)],
  ],
);

object.foo = 456;
object.foo; // 456, actually updated by `property(456)` script.
```

## License

MIT License.
