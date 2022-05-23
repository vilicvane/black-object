import * as x from 'x-value';

/**
 * A Black Object script for function call, with optional implementation.
 * @param ParamSchemas Parameter value schema tuple.
 */
export function call<TParamSchemaTuple extends [unknown, ...unknown[]] | []>(
  ParamSchemas: TParamSchemaTuple,
): {
  type: 'call';
  value: CallImplementation<TParamSchemaTuple, void>;
};
/**
 * @param implementation Function call implementation, will be used as return
 * value if not a function.
 */
export function call<
  TParamSchemaTuple extends [unknown, ...unknown[]] | [],
  TImplementation,
>(
  ParamSchemas: TParamSchemaTuple,
  implementation: TImplementation,
): {
  type: 'call';
  value: TImplementation extends (...args: unknown[]) => unknown
    ? TImplementation extends CallImplementation<
        TParamSchemaTuple,
        infer TReturn
      >
      ? CallImplementation<TParamSchemaTuple, TReturn>
      : never
    : CallImplementation<TParamSchemaTuple, TImplementation>;
};
export function call(
  ParamSchemas: unknown[],
  implementation?: unknown,
): {
  type: 'call';
  value: (...args: unknown[]) => unknown;
} {
  return {
    type: 'call',
    value: (...args) => {
      let issues = diagnose(ParamSchemas, args, []);

      if (issues.length > 0) {
        throw new x.TypeConstraintError('Unexpected parameters', issues);
      }

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
 * @param ValueSchema Parameter value schema.
 * @param implementation Property set implementation.
 */
export function set<
  TValueSchema,
  TImplementation extends
    | ((value: __ResolveValueSchema<TValueSchema>) => boolean | void)
    | boolean,
>(
  ValueSchema: TValueSchema,
  implementation?: TImplementation,
): {
  type: 'set';
  value: TImplementation extends boolean
    ? (value: __ResolveValueSchema<TValueSchema>) => TImplementation
    : TImplementation;
};
export function set(
  ValueSchema: unknown,
  implementation?: ((value: unknown) => boolean | void) | boolean,
): {
  type: 'set';
  value: (value: unknown) => boolean | void;
} {
  return {
    type: 'set',
    value: value => {
      let issues = diagnose(ValueSchema, value, []);

      if (issues.length > 0) {
        throw new x.TypeConstraintError('Unexpected value', issues);
      }

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

export function diagnose(
  schema: unknown,
  value: unknown,
  path: x.TypePath,
): x.TypeIssue[] {
  if (schema instanceof x.Type) {
    return schema.diagnose(value).map(issue => {
      return {
        ...issue,
        path: [...path, ...issue.path],
      };
    });
  }

  if (typeof schema === 'object' && schema !== null) {
    if (Array.isArray(schema)) {
      if (!Array.isArray(value)) {
        throw new TypeError(`Expecting an array, got ${value}`);
      }

      return Array.from(schema).flatMap((elementSchema, index) =>
        diagnose(elementSchema, value[index], [...path, index]),
      );
    } else if (Object.getPrototypeOf(schema) === Object.prototype) {
      if (
        typeof value !== 'object' ||
        value === null ||
        Object.getPrototypeOf(value) !== Object.prototype
      ) {
        throw new TypeError(`Expecting a plain object, got ${value}`);
      }

      return Object.entries(schema).flatMap(([key, valueSchema]) =>
        diagnose(valueSchema, (value as any)[key], [...path, key]),
      );
    }
  }

  if (schema !== value) {
    return [
      {
        path,
        message: `Expecting ${schema}, got ${value}`,
      },
    ];
  }

  return [];
}

type __TypeOfTypeTuple<TTuple extends unknown[]> = {
  [TIndex in keyof TTuple]: __ResolveValueSchema<TTuple[TIndex]>;
};

export type CallImplementation<TParamTypeTuple extends unknown[], TReturn> = (
  ...args: __TypeOfTypeTuple<TParamTypeTuple>
) => TReturn;

export type __ResolveValueSchema<TSchema> = TSchema extends x.Type
  ? x.TypeOf<TSchema>
  : {
      [TKey in keyof TSchema]: TSchema[TKey] extends
        | string
        | number
        | bigint
        | boolean
        | symbol
        | undefined
        | null
        ? TSchema[TKey]
        : __ResolveValueSchema<TSchema[TKey]>;
    };
