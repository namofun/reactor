import { css, KeyCode } from 'azure-devops-ui/Util';

export { css, KeyCode };

/**
 * AssertNever is a utility function that can be used for exhaustiveness checks in switch statements.
 *
 * @public
 */
export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

export type RefObject<T> = {
  (component: T | null): void;
  current: T | null;

  /**
   * @deprecated Use .current as that is consistent the official React Api.
   */
  value: T | null;
};

/**
 * This is a polyfill for the React.createRef() api.
 * For more info on React.createRef() see the official React documentation
 * on creating and accessing refs.
 * @see https://reactjs.org/docs/refs-and-the-dom.html#creating-refs
 * @see https://reactjs.org/docs/refs-and-the-dom.html#accessing-refs
 */
export function createRef<T>(): RefObject<T> {
  const refObject = ((element: T | null): void => {
    refObject.current = element;
  }) as RefObject<T>;

  // This getter is here to support the deprecated value prop on the refObject.
  Object.defineProperty(refObject, 'value', {
    get(): T | null {
      return refObject.current;
    }
  });

  refObject.current = null;

  return refObject;
}

// Initialize global window id.
const CURRENT_ID_PROPERTY = '__currentId__';
const DEFAULT_ID_STRING = 'id__';

// tslint:disable-next-line:no-any
let _global: any = (typeof window !== 'undefined' && window) || process;

if (_global[CURRENT_ID_PROPERTY] === undefined) {
  _global[CURRENT_ID_PROPERTY] = 0;
}

/**
 * Generates a unique id in the global scope (this spans across duplicate copies of the same library.)
 *
 * @public
 */
export function getId(prefix?: string): string {
  let index = _global[CURRENT_ID_PROPERTY]++;

  return (prefix || DEFAULT_ID_STRING) + index;
}

// Regex that finds { and } so they can be removed on a lookup for string format
const FORMAT_ARGS_REGEX = /[\{\}]/g;

// Regex that finds {#} so it can be replaced by the arguments in string format
const FORMAT_REGEX = /\{\d+\}/g;

/**
 * String format method, used for scenarios where at runtime you
 * need to evaluate a formatted string given a tokenized string. This
 * usually only is needed in localization scenarios.

 * Example "I love {0} every {1}".format("CXP") will result in a Debug Exception.
 *
 * @public
 */
// tslint:disable-next-line:no-any
export function format(s: string, ...values: any[]): string {
  let args = values;
  // Callback match function
  function replace_func(match: string): string {
    // looks up in the args
    // tslint:disable-next-line:no-any
    let replacement = args[match.replace(FORMAT_ARGS_REGEX, '') as any];

    // catches undefined in nondebug and null in debug and nondebug
    if (replacement === null || replacement === undefined) {
      replacement = '';
    }

    return replacement;
  }
  return (s.replace(FORMAT_REGEX, replace_func));
}

let _isSSR = false;

/**
 * Helper to get the document object.
 *
 * @public
 */
export function getDocument(rootElement?: HTMLElement | null): Document | undefined {
  if (_isSSR || typeof document === 'undefined') {
    return undefined;
  } else {
    return rootElement && rootElement.ownerDocument ? rootElement.ownerDocument : document;
  }
}

/**
 * Fetches an item from session storage without throwing an exception
 * @param key The key of the item to fetch from session storage
 */
export function getItem(key: string): string | null {
  let result: string | null = null;
  try {
    result = window.sessionStorage.getItem(key);
  } catch (e) {
    /* Eat the exception */
  }
  return result;
}

/**
 * Inserts an item into session storage without throwing an exception
 * @param key The key of the item to add to session storage
 * @param data The data to put into session storage
 */
export function setItem(key: string, data: string): void {
  try {
    window.sessionStorage.setItem(key, data);
  } catch (e) {
    /* Eat the exception */
  }
}
