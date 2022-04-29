import {Type, deepEqual, tuple} from 'x-value';
import type {TypeOf} from 'x-value';

/**
 * A Black Object script for function call, with optional implementation.
 * @param ParamTypes Parameter type tuple, either an x-value type (e.g.,
 * `x.string`) or a normal value that will be wrapped with `x.deepEqual(...)`.
 */
export function call<TParamTypeTuple extends [unknown, ...unknown[]] | []>(
  ParamTypes: TParamTypeTuple,
): {
  type: 'call';
  value: CallImplementation<TParamTypeTuple, void>;
};
/**
 * @param implementation Function call implementation, will be used as return
 * value if not a function.
 */
export function call<
  TParamTypeTuple extends [unknown, ...unknown[]] | [],
  TImplementation,
>(
  ParamTypes: TParamTypeTuple,
  implementation: TImplementation,
): {
  type: 'call';
  value: TImplementation extends (...args: unknown[]) => unknown
    ? TImplementation extends CallImplementation<TParamTypeTuple, infer TReturn>
      ? CallImplementation<TParamTypeTuple, TReturn>
      : never
    : CallImplementation<TParamTypeTuple, TImplementation>;
};
export function call(
  ParamTypes: unknown[],
  implementation?: unknown,
): {
  type: 'call';
  value: (...args: unknown[]) => unknown;
} {
  return {
    type: 'call',
    value: (...args) => {
      tuple(
        ...ParamTypes.map(ParamType =>
          ParamType instanceof Type ? ParamType : deepEqual(ParamType),
        ),
      ).satisfies(args);

      return typeof implementation === 'function'
        ? implementation(...args)
        : implementation;
    },
  };
}

/**
 * A Black Object script for property get.
 * @param implementation Property get implementation, will be used as return
 * value if not a function.
 */
export function get<TImplementation>(implementation: TImplementation): {
  type: 'get';
  value: TImplementation extends (...args: unknown[]) => unknown
    ? TImplementation extends () => unknown
      ? TImplementation
      : never
    : () => TImplementation;
};
export function get(implementation: unknown): {
  type: 'get';
  value: () => unknown;
} {
  return {
    type: 'get',
    value: () => {
      return typeof implementation === 'function'
        ? implementation()
        : implementation;
    },
  };
}

/**
 * A Black Object script for property set, with optional implementation.
 * @param ParamTypes Value type, either an x-value type (e.g., `x.string`) or a
 * normal value that will be wrapped with `x.deepEqual(...)`.
 * @param implementation Property set implementation.
 */
export function set<
  TValueType,
  TImplementation extends
    | ((
        value: TValueType extends Type ? TypeOf<TValueType> : TValueType,
      ) => boolean | void)
    | boolean,
>(
  ValueType: TValueType,
  implementation?: TImplementation,
): {
  type: 'set';
  value: TImplementation extends boolean
    ? (
        value: TValueType extends Type ? TypeOf<TValueType> : TValueType,
      ) => TImplementation
    : TImplementation;
};
export function set(
  ValueType: unknown,
  implementation?: ((value: unknown) => boolean | void) | boolean,
): {
  type: 'set';
  value: (value: unknown) => boolean | void;
} {
  return {
    type: 'set',
    value: value => {
      (ValueType instanceof Type ? ValueType : deepEqual(ValueType)).satisfies(
        value,
      );

      return typeof implementation === 'function'
        ? implementation?.(value)
        : implementation;
    },
  };
}

/**
 * A Black Object script for property update.
 */
export function property<TValue>(value: TValue): {
  type: 'property';
  value: TValue;
} {
  return {
    type: 'property',
    value,
  };
}

type __TypeOfTypeTuple<TTuple extends unknown[]> = {
  [TIndex in keyof TTuple]: TTuple[TIndex] extends Type
    ? TypeOf<TTuple[TIndex]>
    : TTuple[TIndex];
};

export type CallImplementation<TParamTypeTuple extends unknown[], TReturn> = (
  ...args: __TypeOfTypeTuple<TParamTypeTuple>
) => TReturn;
