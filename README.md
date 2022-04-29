[![NPM version](https://img.shields.io/npm/v/black-object?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/black-object)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/black-object?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT license](https://img.shields.io/github/license/vilic/black-object?style=flat-square)](./LICENSE)

# Black Object

```ts
const id = '123';

const blackObject = createBlackObject<IPaymentAdapter>([
  ['createOrder', call([], id)],
  ['queryOrder', call([x.equal(id)], {id, ready: false})],
  ['cancelOrder', call([x.equal(id)], true)],
]);

let id = blackObject.createOrder();
let order = blackObject.queryOrder(id);
blackObject.cancelOrder(id);

assertScriptsCompleted(blackObject);
```

## License

MIT License.
