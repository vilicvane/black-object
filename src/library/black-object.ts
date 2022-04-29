const hasOwnProperty = Object.prototype.hasOwnProperty;

const PENDING_SCRIPT_SYMBOL = Symbol();

/**
 * Create a Black Object with predefined fallback partial and scripts.
 * @param partial Partial to fallback if scripts not hit.
 * @param scripts Scripts for call/get/set and property update.
 */
export function createBlackObject<T extends object>(
  partial: Partial<T>,
  scripts: Script<T>[],
): T;
export function createBlackObject<T extends object>(scripts: Script<T>[]): T;
export function createBlackObject(
  ...args:
    | [partial: object, scripts: [string, ScriptContent][]]
    | [scripts: [string, ScriptContent][]]
): object {
  let [partial, scripts] = isElementAtIndexArray(args, 0)
    ? [{}, ...args]
    : args;

  interface ScriptContentWithKey extends ScriptContent {
    key: string;
  }

  let scriptContents = scripts.map(([key, content]): ScriptContentWithKey => {
    let scriptContent = {
      key,
      ...content,
    };

    if (content.type === 'call') {
      return wrapScriptContentFunction(scriptContent);
    } else {
      return scriptContent;
    }
  });

  let pendingScriptContents: ScriptContentWithKey[] = [];

  return new Proxy(partial, {
    get(target, key) {
      if (key === PENDING_SCRIPT_SYMBOL) {
        return (
          scriptContents.length === 0 && pendingScriptContents.length === 0
        );
      }

      let matchingPendingScriptContent = pendingScriptContents.find(
        content => content.key === key,
      );

      if (matchingPendingScriptContent) {
        return matchingPendingScriptContent.value;
      }

      let scriptContent = scriptContents[0];

      if (scriptContent && scriptContent.key === key) {
        scriptContents.shift();

        let {type, value: fn} = scriptContent;

        switch (type) {
          case 'property':
            (target as any)[key] = fn;
            return fn;
          case 'get':
            return (fn as () => unknown).call(this);
          case 'call':
            pendingScriptContents.push(scriptContent);
            (target as any)[key] = fn;
            return fn;
          default:
            throw new Error(`Unexpected script type ${type}`);
        }
      }

      if (!hasOwnProperty.call(target, key)) {
        throw new Error(`Unexpected key ${JSON.stringify(key)}`);
      }

      return (target as any)[key];
    },
    set(target, key, value) {
      let scriptContent = scriptContents[0];

      if (scriptContent && scriptContent.key === key) {
        scriptContents.shift();

        let {type, value: fn} = scriptContent;

        switch (type) {
          case 'set':
            return (
              (fn as (value: unknown) => boolean | void).call(this, value) ??
              true
            );
          default:
            throw new Error(`Unexpected script type ${type}`);
        }
      }

      if (!hasOwnProperty.call(target, key)) {
        throw new Error(`Unexpected key ${JSON.stringify(key)}`);
      }

      return Reflect.set(target, key, value);
    },
  });

  function wrapScriptContentFunction({
    value: fn,
    ...rest
  }: ScriptContentWithKey): ScriptContentWithKey {
    if (typeof fn !== 'function') {
      throw new TypeError();
    }

    let scriptContent: ScriptContentWithKey = {
      ...rest,
      value(this: unknown, ...args: unknown[]) {
        let next = pendingScriptContents[0];

        if (scriptContent !== next) {
          if (next) {
            throw new Error(
              `Unexpected script ${scriptContent.type} ${scriptContent.key}, expecting ${next.key}`,
            );
          } else {
            throw new Error(
              `Unexpected script ${scriptContent.type} ${scriptContent.key}, no pending scripts`,
            );
          }
        }

        pendingScriptContents.shift();

        return (fn as (...args: unknown[]) => unknown).apply(this, args);
      },
    };

    return scriptContent;
  }
}

/**
 * Throw an error if the scripts defined with the Black Object is not completed.
 */
export function assertScriptsCompleted(blackObject: object): void {
  if (!(blackObject as any)[PENDING_SCRIPT_SYMBOL]) {
    throw new Error('Black Object still has pending scripts');
  }
}

export type ScriptType = 'property' | 'get' | 'set' | 'call';

export interface ScriptContent<
  TType extends ScriptType = ScriptType,
  TValue = unknown,
> {
  type: TType;
  value: TValue;
}

export type Script<T extends object> = {
  [TKey in keyof T]: [
    TKey,
    T[TKey] extends infer TValue
      ? TValue extends (...args: unknown[]) => unknown
        ? ScriptContent<'call', TValue>
        :
            | ScriptContent<'get', () => TValue>
            | ScriptContent<'set', (value: TValue) => void>
            | ScriptContent<'property', TValue>
      : never,
  ];
}[keyof T];

function isElementAtIndexArray<TTuple extends unknown[], TIndex extends number>(
  tuple: TTuple,
  index: TIndex,
): tuple is Extract<TTuple, {[TKey in TIndex]: unknown[]}> {
  return Array.isArray(tuple[index]);
}
