import {tuple} from 'x-value';
import type {Type, TypeOf} from 'x-value';

export function call<TParamTypeTuple extends [Type, ...Type[]] | []>(
  ParamTypes: TParamTypeTuple,
): {
  type: 'call';
  value: CallImplementation<TParamTypeTuple, void>;
};
export function call<
  TParamTypeTuple extends [Type, ...Type[]] | [],
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
  ParamTypes: Type[],
  implementation?: unknown,
): {
  type: 'call';
  value: (...args: unknown[]) => unknown;
} {
  return {
    type: 'call',
    value: (...args) => {
      tuple(...ParamTypes).satisfies(args);

      return typeof implementation === 'function'
        ? implementation(...args)
        : implementation;
    },
  };
}

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

export function set<
  TValueType extends Type,
  TImplementation extends
    | ((value: TypeOf<TValueType>) => boolean | void)
    | boolean,
>(
  ValueType: TValueType,
  implementation?: TImplementation,
): {
  type: 'set';
  value: TImplementation extends boolean
    ? (value: TypeOf<TValueType>) => TImplementation
    : TImplementation;
};
export function set(
  ValueType: Type,
  implementation?: ((value: unknown) => boolean | void) | boolean,
): {
  type: 'set';
  value: (value: unknown) => boolean | void;
} {
  return {
    type: 'set',
    value: value => {
      ValueType.satisfies(value);

      return typeof implementation === 'function'
        ? implementation?.(value)
        : implementation;
    },
  };
}

export function property<TValue>(value: TValue): {
  type: 'property';
  value: TValue;
} {
  return {
    type: 'property',
    value,
  };
}

type __TypeOfTypeTuple<TTuple extends Type[]> = {
  [TIndex in keyof TTuple]: TTuple[TIndex] extends Type
    ? TypeOf<TTuple[TIndex]>
    : never;
};

export type CallImplementation<TParamTypeTuple extends Type[], TReturn> = (
  ...args: __TypeOfTypeTuple<TParamTypeTuple>
) => TReturn;
