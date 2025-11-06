export let LAST_ERROR: Error | null = null // Only works for throws with this lib



// Vanilla functions (regardless of Node or Web)
export function find_self_in_arr<T>(_array: Array<T>, _lookFor: T): T | undefined {
  return _array.find(item => item === _lookFor)
}
export function find_val_in_map<K, V>(_map: Map<K, V[]>, _value: V): K | undefined {
  for (const [key, values] of _map.entries())
    if (values.includes(_value))
      return key
  return undefined
}



export function to_str(_x: unknown): string {
  if (typeof _x === "string")
    return _x
  if (_x === null || _x === undefined)
    return String(_x)
  try {
    return typeof (_x as any).toString === "function" ? (_x as any).toString() : JSON.stringify(_x)
  } catch {
    try { return JSON.stringify(_x) }
    catch { return String(_x) }
  }
}



export abstract class AnyErr extends Error {
  constructor(_msg: string) {
    super(`AnyErr->${new.target.name} because: ${_msg}`)
    Object.setPrototypeOf(this, new.target.prototype)
    LAST_ERROR = this
  }
}



export function range(_from: number, _to?: number, _step: number = 1): Array<number> {
  if (_to === undefined)
    [_from, _to] = [0, _from] // If only one way
  let result: Array<number> = []
  if (_from < _to)
    for (let i = _from; i < _to; i += _step)
      result.push(i)
  else if (_from > _to)
    for (let i = _from; i > _to; i -= _step)
      result.push(i)
  return result
}



export function or_err<T>(_x: T | undefined | null, _ErrCtor: new (...args: any[]) => Error = Error, _msg: string = "or_err assert failed"): T {
  if (_x === undefined || _x === null)
    throw new _ErrCtor(_msg)
  return _x
}



export class TrimErr extends AnyErr {}

export const TRIM_WITH = "..." as const

export function trim_begin(_str: string, _maxLen: number): string {
  /*
    Shorten string from the beginning if it exceeds `_maxLen`
  */
  if (_maxLen <= TRIM_WITH.length)
    throw new TrimErr(`trim_begin _maxLen too short: ${_maxLen}`)
  if (_str.length <= _maxLen)
    return _str
  return TRIM_WITH + _str.slice(_str.length - (_maxLen - TRIM_WITH.length))
}

export function trim_end(_str: string, _maxLen: number): string {
  /*
    Shorten string from the end if it exceeds `maxLen`
 */
  if (_maxLen <= TRIM_WITH.length)
    throw new TrimErr(`trim_end _maxLen too short: ${_maxLen}`)
  if (_str.length <= _maxLen)
    return _str
  return _str.slice(0, _maxLen - TRIM_WITH.length) + TRIM_WITH
}



export function time_to_str(): string {
  /*
    Returns HH:MM:SS-DD:MM:YYYY
  */
  const n = new Date()
  const p = (n: number) => n.toString().padStart(2, "0")
  return `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}-${p(n.getDate())}:${p(n.getMonth() + 1)}:${n.getFullYear()}`
}



export async function sleep(_ms: number): Promise<void> {
  if (_ms <= 0)
    return
  return new Promise(resolve => setTimeout(resolve, _ms));
}



export const enum ANSII_ESCAPE {
  BOLD = "\u001b[1m",
  ITALIC = "\u001b[3m",
  UNDERLINE = "\u001b[4m",
  STRIKETHROUGH = "\u001b[9m",
  RESET = "\u001b[0m",
  BLACK = "\u001b[30m",
  RED = "\u001b[31m",
  GREEN = "\u001b[32m",
  YELLOW = "\u001b[33m",
  BLUE = "\u001b[34m",
  MAGENTA = "\u001b[35m",
  CYAN = "\u001b[36m",
  WHITE = "\u001b[37m"
}
export class Out {
  silence: boolean = false
  suffix: string = ""
  prefix: string
  constructor(_prefix: string, _color?: ANSII_ESCAPE) {
    this.prefix = _prefix
    if (_color)
      this.prefix = _color + this.prefix + ANSII_ESCAPE.RESET
  }

  print(..._args: any[]) {
    if (!this.silence)
      console.log(`[${time_to_str()}]${this.prefix}${this.suffix}`, ..._args)
  }
}



export function remove_all_from_arr<T>(_arr: Array<T>, _lookFor: T): void {
  let i = 0
  while (i < _arr.length)
    if (_arr[i] === _lookFor)
      _arr.splice(i, 1)
    else
      i++
}



export function inline_try<T>(_func: Function, ..._args: unknown[]): T | null {
  try { return _func(..._args) }
  catch (e) { return null }
}



export function entries<T extends Record<string, any>>(_obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(_obj) as [keyof T, T[keyof T]][]
}



export function rm_fileprotocol_from_src(_rawPath: string): string {
  return _rawPath.replace(/^file:\/\/\//, "");
}



export class AssErr extends AnyErr {}
export function ass(_conditionResult: boolean): void { // ass-ert
  if (!_conditionResult)
    throw new AssErr("Assertion failed")
}



export function freezer<T extends object>(obj: T): T {
  Object.freeze(obj)
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value))
      freezer(value)
  })
  return obj
}



export class RetryErr extends AnyErr {}
export async function retry<T, Args extends any[]>(_fn: (..._args: Args) => Promise<T> | T, _maxAttempts: number, _delayMs: number, ..._args: Args): Promise<T> {
  while (--_maxAttempts >= 0) {
    try {
      return await _fn(..._args)
    } catch (err: unknown) {
      if (_maxAttempts === 0)
        throw err
      await sleep(_delayMs)
    }
  }
  throw new RetryErr("Unreachable")
}



export const REGISTRY = new FinalizationRegistry((delFn: () => void) => {
  /*
    Attempt to proivde somewhat of a RAII-experience.
  */
  delFn()
})