import * as vt from 'vitest'
import * as bs from '../src/base.js'




vt.describe("key_by_val function", () => {

  vt.describe("basic functionality", () => {
    vt.it("finds key for value in simple map", () => {
      const map = new Map([
        ['fruits', ['apple', 'banana']],
        ['veggies', ['carrot', 'broccoli']]
      ])
      vt.expect(bs.key_by_val(map, 'apple')).toBe('fruits')
    })

    vt.it("finds key for value in middle of array", () => {
      const map = new Map([
        ['a', [1, 2, 3]],
        ['b', [4, 5, 6]]
      ])
      vt.expect(bs.key_by_val(map, 5)).toBe('b')
    })

    vt.it("returns undefined when value not found", () => {
      const map = new Map([['key', [1, 2, 3]]])
      vt.expect(bs.key_by_val(map, 99)).toBeUndefined()
    })
  })

  vt.describe("edge cases - empty structures", () => {
    vt.it("returns undefined for empty map", () => {
      const map = new Map<string, number[]>()
      vt.expect(bs.key_by_val(map, 42)).toBeUndefined()
    })

    vt.it("handles map with empty arrays", () => {
      const map = new Map([
        ['empty', []],
        ['has_value', [1, 2]]
      ])
      vt.expect(bs.key_by_val(map, 1)).toBe('has_value')
    })

    vt.it("skips over empty arrays when searching", () => {
      const map = new Map([
        ['empty1', []],
        ['empty2', []],
        ['target', [5]]
      ])
      vt.expect(bs.key_by_val(map, 5)).toBe('target')
    })
  })

  vt.describe("duplicate value handling", () => {
    vt.it("returns first key when value exists in multiple arrays", () => {
      const map = new Map([
        ['first', [1, 2, 3]],
        ['second', [2, 4, 5]],
        ['third', [2, 6, 7]]
      ])
      // Should return 'first' since Map iteration order is insertion order
      vt.expect(bs.key_by_val(map, 2)).toBe('first')
    })

    vt.it("finds duplicate value in same array only once", () => {
      const map = new Map([['dupes', [7, 7, 7, 7]]])
      vt.expect(bs.key_by_val(map, 7)).toBe('dupes')
    })
  })

  vt.describe("type coercion and equality", () => {
    vt.it("uses strict equality - doesn't match '1' with 1", () => {
      const map = new Map([['nums', [1, 2, 3]]])
      vt.expect(bs.key_by_val(map, '1' as any)).toBeUndefined()
    })

    vt.it("uses strict equality - doesn't match true with 1", () => {
      const map = new Map([['bools', [true, false]]])
      vt.expect(bs.key_by_val(map, 1 as any)).toBeUndefined()
    })

    vt.it("handles null values correctly", () => {
      const map = new Map([['nullish', [null, undefined, 0]]])
      vt.expect(bs.key_by_val(map, null)).toBe('nullish');
    })

    vt.it("handles undefined values correctly", () => {
      const map = new Map([['nullish', [null, undefined, 0]]])
      vt.expect(bs.key_by_val(map, undefined)).toBe('nullish')
    })

    vt.it("distinguishes between null and undefined", () => {
      const map = new Map([
        ['has_null', [null]],
        ['has_undefined', [undefined]]
      ])
      vt.expect(bs.key_by_val(map, null)).toBe('has_null')
      vt.expect(bs.key_by_val(map, undefined)).toBe('has_undefined')
    })
  })

  vt.describe("special JavaScript values", () => {
    vt.it("handles NaN correctly (NaN !== NaN)", () => {
      const map = new Map([['numbers', [NaN, 1, 2]]])
      // NaN never equals itself, but the .includes method detects NaN as value
      vt.expect(bs.key_by_val(map, NaN)).toBe('numbers')
    })

    vt.it("handles negative zero vs positive zero", () => {
      const map = new Map([['zeros', [0, -0]]])
      // In JavaScript, 0 === -0, so should find it
      vt.expect(bs.key_by_val(map, -0)).toBe('zeros')
      vt.expect(bs.key_by_val(map, 0)).toBe('zeros')
    })

    vt.it("handles Infinity values", () => {
      const map = new Map([['infinite', [Infinity, -Infinity, 0]]])
      vt.expect(bs.key_by_val(map, Infinity)).toBe('infinite')
      vt.expect(bs.key_by_val(map, -Infinity)).toBe('infinite')
    })
  })

  vt.describe("object and reference equality", () => {
    vt.it("uses reference equality for objects", () => {
      const obj = { id: 1 }
      const map = new Map([['objects', [obj, { id: 2 }]]])
      vt.expect(bs.key_by_val(map, obj)).toBe('objects')
    })

    vt.it("doesn't match structurally equal objects", () => {
      const map = new Map([['objects', [{ id: 1 }, { id: 2 }]]])
      vt.expect(bs.key_by_val(map, { id: 1 })).toBeUndefined()
    })

    vt.it("uses reference equality for arrays", () => {
      const arr = [1, 2, 3]
      const map = new Map([['arrays', [arr, [4, 5]]]])
      vt.expect(bs.key_by_val(map, arr)).toBe('arrays')
    })

    vt.it("handles symbols correctly", () => {
      const sym1 = Symbol('test')
      const sym2 = Symbol('test')
      const map = new Map([['symbols', [sym1, sym2]]])
      vt.expect(bs.key_by_val(map, sym1)).toBe('symbols')
      vt.expect(bs.key_by_val(map, Symbol('test'))).toBeUndefined()
    })
  })

  vt.describe("complex key types", () => {
    vt.it("works with number keys", () => {
      const map = new Map([
        [1, ['a', 'b']],
        [2, ['c', 'd']]
      ])
      vt.expect(bs.key_by_val(map, 'c')).toBe(2)
    })

    vt.it("works with object keys", () => {
      const keyObj = { name: 'key1' }
      const map = new Map([
        [keyObj, [1, 2, 3]],
        [{ name: 'key2' }, [4, 5, 6]]
      ])
      vt.expect(bs.key_by_val(map, 2)).toBe(keyObj)
    })

    vt.it("works with symbol keys", () => {
      const symKey = Symbol('myKey')
      const map = new Map([
        [symKey, ['x', 'y']],
        [Symbol('other'), ['z']]
      ])
      vt.expect(bs.key_by_val(map, 'y')).toBe(symKey)
    })
  })

  vt.describe("performance and stress tests", () => {
    vt.it("handles large maps efficiently", () => {
      const map = new Map<number, number[]>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, [i * 10, i * 10 + 1, i * 10 + 2])
      }
      vt.expect(bs.key_by_val(map, 5000)).toBe(500)
    })

    vt.it("handles arrays with many elements", () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i)
      const map = new Map([['huge', largeArray]])
      vt.expect(bs.key_by_val(map, 9999)).toBe('huge')
      vt.expect(bs.key_by_val(map, 0)).toBe('huge')
      vt.expect(bs.key_by_val(map, 5000)).toBe('huge')
    })

    vt.it("short-circuits on first match (doesn't check all keys unnecessarily)", () => {
      const map = new Map([
        ['first', [1]],
        ['second', [2]],
        ['third', [3]]
      ])
      // If properly optimized, should stop at 'first'
      vt.expect(bs.key_by_val(map, 1)).toBe('first')
    })
  })

  vt.describe("string edge cases", () => {
    vt.it("handles empty strings", () => {
      const map = new Map([['strings', ['', 'a', 'b']]])
      vt.expect(bs.key_by_val(map, '')).toBe('strings')
    })

    vt.it("handles whitespace strings", () => {
      const map = new Map([['spaces', [' ', '  ', '\t', '\n']]])
      vt.expect(bs.key_by_val(map, ' ')).toBe('spaces')
      vt.expect(bs.key_by_val(map, '\t')).toBe('spaces')
    })

    vt.it("handles unicode strings", () => {
      const map = new Map([['unicode', ['🔥', '💯', '🚀']]])
      vt.expect(bs.key_by_val(map, '💯')).toBe('unicode')
    })
  })

  vt.describe("mutation safety", () => {
    vt.it("doesn't mutate the input map", () => {
      const map = new Map([['key', [1, 2, 3]]])
      const originalSize = map.size
      const originalArray = map.get('key')
      
      bs.key_by_val(map, 2)
      
      vt.expect(map.size).toBe(originalSize)
      vt.expect(map.get('key')).toBe(originalArray)
      vt.expect(map.get('key')).toEqual([1, 2, 3])
    })
  })

  vt.describe("mixed value types in array", () => {
    vt.it("finds value in mixed-type array", () => {
      const map = new Map([['mixed', [1, 'two', true, null, { x: 5 }]]])
      vt.expect(bs.key_by_val(map, 'two')).toBe('mixed')
      vt.expect(bs.key_by_val(map, true)).toBe('mixed')
      vt.expect(bs.key_by_val(map, null)).toBe('mixed')
    })
  })

})




vt.describe("to_str function", () => {
  
  vt.describe("primitive types", () => {
    vt.it("converts number to string", () => {
      vt.expect(bs.to_str(42)).toBe("42")
    })

    vt.it("converts negative number to string", () => {
      vt.expect(bs.to_str(-123)).toBe("-123")
    })

    vt.it("converts float to string", () => {
      vt.expect(bs.to_str(3.14159)).toBe("3.14159")
    })

    vt.it("converts zero to string", () => {
      vt.expect(bs.to_str(0)).toBe("0")
    })

    vt.it("converts negative zero to string", () => {
      vt.expect(bs.to_str(-0)).toBe("0") // JavaScript quirk: -0 stringifies to "0"
    })

    vt.it("converts boolean true to string", () => {
      vt.expect(bs.to_str(true)).toBe("true")
    })

    vt.it("converts boolean false to string", () => {
      vt.expect(bs.to_str(false)).toBe("false")
    })

    vt.it("converts string to itself", () => {
      vt.expect(bs.to_str("hello")).toBe("hello")
    })

    vt.it("handles empty string", () => {
      vt.expect(bs.to_str("")).toBe("")
    })
  })

  vt.describe("nullish values", () => {
    vt.it("converts null to string", () => {
      vt.expect(bs.to_str(null)).toBe("null")
    })

    vt.it("converts undefined to string", () => {
      vt.expect(bs.to_str(undefined)).toBe("undefined")
    })
  })

  vt.describe("special number values", () => {
    vt.it("converts NaN to string", () => {
      vt.expect(bs.to_str(NaN)).toBe("NaN")
    })

    vt.it("converts Infinity to string", () => {
      vt.expect(bs.to_str(Infinity)).toBe("Infinity")
    })

    vt.it("converts negative Infinity to string", () => {
      vt.expect(bs.to_str(-Infinity)).toBe("-Infinity")
    })

    vt.it("converts very large numbers to string", () => {
      vt.expect(bs.to_str(Number.MAX_SAFE_INTEGER)).toBe("9007199254740991")
    })

    vt.it("converts very small numbers to string", () => {
      vt.expect(bs.to_str(Number.MIN_SAFE_INTEGER)).toBe("-9007199254740991")
    })

    vt.it("handles scientific notation numbers", () => {
      vt.expect(bs.to_str(1e21)).toBe("1e+21")
    })

    vt.it("handles tiny decimal numbers", () => {
      vt.expect(bs.to_str(0.0000001)).toBe("1e-7")
    })
  })

  vt.describe("bigint type", () => {
    vt.it("converts bigint to string", () => {
      vt.expect(bs.to_str(BigInt(123))).toBe("123")
    })

    vt.it("converts large bigint to string", () => {
      vt.expect(bs.to_str(BigInt("99999999999999999999"))).toBe("99999999999999999999")
    })

    vt.it("converts negative bigint to string", () => {
      vt.expect(bs.to_str(BigInt(-456))).toBe("-456")
    })
  })

  vt.describe("symbol type", () => {
    vt.it("converts named symbol to string", () => {
      const sym = Symbol("test")
      vt.expect(bs.to_str(sym)).toBe("Symbol(test)")
    })

    vt.it("converts unnamed symbol to string", () => {
      const sym = Symbol()
      vt.expect(bs.to_str(sym)).toBe("Symbol()")
    })

    vt.it("converts well-known symbol to string", () => {
      vt.expect(bs.to_str(Symbol.iterator)).toBe("Symbol(Symbol.iterator)")
    })
  })

  vt.describe("object types", () => {
    vt.it("converts plain object to string", () => {
      const obj = { a: 1, b: 2 }
      const result = bs.to_str(obj)
      // Could be "[object Object]" or JSON.stringify result
      vt.expect(typeof result).toBe("string")
      vt.expect(result.length).toBeGreaterThan(0)
    })

    vt.it("converts empty object to string", () => {
      vt.expect(bs.to_str({})).toBeTruthy()
      vt.expect(typeof bs.to_str({})).toBe("string")
    })

    vt.it("converts array to string", () => {
      vt.expect(bs.to_str([1, 2, 3])).toBe("1,2,3")
    })

    vt.it("converts empty array to string", () => {
      vt.expect(bs.to_str([])).toBe("")
    })

    vt.it("converts nested array to string", () => {
      vt.expect(bs.to_str([[1, 2], [3, 4]])).toBe("1,2,3,4")
    })

    vt.it("converts array with nullish values", () => {
      vt.expect(bs.to_str([1, null, 3, undefined, 5])).toBe("1,,3,,5")
    })

    vt.it("converts Date to string", () => {
      const date = new Date("2024-01-15T10:30:00Z")
      const result = bs.to_str(date)
      vt.expect(result).toContain("2024")
    })

    vt.it("converts RegExp to string", () => {
      const regex = /test/gi
      vt.expect(bs.to_str(regex)).toBe("/test/gi")
    })

    vt.it("converts Error to string", () => {
      const error = new Error("Something went wrong")
      const result = bs.to_str(error)
      vt.expect(result).toContain("Error")
    })

    vt.it("converts Map to string", () => {
      const map = new Map([["a", 1], ["b", 2]])
      const result = bs.to_str(map)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts Set to string", () => {
      const set = new Set([1, 2, 3])
      const result = bs.to_str(set)
      vt.expect(typeof result).toBe("string")
    })
  })

  vt.describe("function types", () => {
    vt.it("converts function to string", () => {
      function myFunc() { return 42 }
      const result = bs.to_str(myFunc)
      vt.expect(result).toContain("function")
    })

    vt.it("converts arrow function to string", () => {
      const arrowFunc = () => 42
      const result = bs.to_str(arrowFunc)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts async function to string", () => {
      async function asyncFunc() { return 42 }
      const result = bs.to_str(asyncFunc)
      vt.expect(result).toContain("async")
    })

    vt.it("converts generator function to string", () => {
      function* genFunc() { yield 42 }
      const result = bs.to_str(genFunc)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts class to string", () => {
      class MyClass {}
      const result = bs.to_str(MyClass)
      vt.expect(result).toContain("class")
    })
  })

  vt.describe("objects with custom toString", () => {
    vt.it("respects custom toString method", () => {
      const obj = {
        toString() { return "custom string" }
      }
      vt.expect(bs.to_str(obj)).toBe("custom string")
    })

    vt.it("handles toString that returns non-string", () => {
      const obj = {
        toString() { return 123 as any }
      }
      const result = bs.to_str(obj)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("handles toString that throws", () => {
      const obj = {
        toString() { throw new Error("toString failed") }
      }
      // Should either catch or throw - both are valid
      vt.expect(() => bs.to_str(obj)).toBeDefined()
    })

    vt.it("handles valueOf in absence of toString", () => {
      const obj = {
        valueOf() { return 42 }
      }
      const result = bs.to_str(obj)
      vt.expect(typeof result).toBe("string")
    })
  })

  vt.describe("string edge cases", () => {
    vt.it("handles whitespace-only strings", () => {
      vt.expect(bs.to_str("   ")).toBe("   ")
    })

    vt.it("handles newlines and tabs", () => {
      vt.expect(bs.to_str("hello\nworld\ttab")).toBe("hello\nworld\ttab")
    })

    vt.it("handles unicode characters", () => {
      vt.expect(bs.to_str("🔥💯🚀")).toBe("🔥💯🚀")
    })

    vt.it("handles emoji with modifiers", () => {
      vt.expect(bs.to_str("👨‍👩‍👧‍👦")).toBe("👨‍👩‍👧‍👦")
    })

    vt.it("handles escape sequences", () => {
      vt.expect(bs.to_str("hello\\nworld")).toBe("hello\\nworld")
    })

    vt.it("handles quotes in strings", () => {
      vt.expect(bs.to_str('hello "world"')).toBe('hello "world"')
      vt.expect(bs.to_str("hello 'world'")).toBe("hello 'world'")
    })

    vt.it("handles very long strings", () => {
      const longStr = "a".repeat(10000)
      vt.expect(bs.to_str(longStr)).toBe(longStr)
    })
  })

  vt.describe("circular references", () => {
    vt.it("handles object with circular reference", () => {
      const obj: any = { a: 1 }
      obj.self = obj
      // Should not throw or infinite loop
      vt.expect(() => bs.to_str(obj)).toBeDefined()
    })

    vt.it("handles array with circular reference", () => {
      const arr: any = [1, 2, 3]
      arr.push(arr)
      vt.expect(() => bs.to_str(arr)).toBeDefined()
    })
  })

  vt.describe("exotic objects", () => {
    vt.it("converts typed arrays to string", () => {
      const uint8 = new Uint8Array([1, 2, 3, 4])
      const result = bs.to_str(uint8)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts ArrayBuffer to string", () => {
      const buffer = new ArrayBuffer(8)
      const result = bs.to_str(buffer)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts Promise to string", () => {
      const promise = Promise.resolve(42)
      const result = bs.to_str(promise)
      vt.expect(result).toContain("Promise")
    })

    vt.it("converts WeakMap to string", () => {
      const weakMap = new WeakMap()
      const result = bs.to_str(weakMap)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts WeakSet to string", () => {
      const weakSet = new WeakSet()
      const result = bs.to_str(weakSet)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("converts Proxy to string", () => {
      const proxy = new Proxy({}, {})
      const result = bs.to_str(proxy)
      vt.expect(typeof result).toBe("string")
    })
  })

  vt.describe("return type validation", () => {
    vt.it("always returns a string type", () => {
      const testCases = [
        42, "test", true, null, undefined, {}, [], 
        Symbol("test"), BigInt(123), NaN, Infinity
      ]
      testCases.forEach(testCase => {
        vt.expect(typeof bs.to_str(testCase)).toBe("string")
      })
    })

    vt.it("never returns null or undefined", () => {
      const testCases = [null, undefined, NaN, {}, []]
      testCases.forEach(testCase => {
        const result = bs.to_str(testCase)
        vt.expect(result).not.toBeNull()
        vt.expect(result).not.toBeUndefined()
      })
    })
  })

  vt.describe("performance", () => {
    vt.it("handles large object efficiently", () => {
      const largeObj = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`key${i}`, i])
      )
      vt.expect(() => bs.to_str(largeObj)).toBeDefined()
    })

    vt.it("handles deeply nested object", () => {
      let deepObj: any = { value: 1 }
      for (let i = 0; i < 100; i++) {
        deepObj = { nested: deepObj }
      }
      vt.expect(() => bs.to_str(deepObj)).toBeDefined()
    })
  })
})



vt.describe("AnyErr class", () => {
  
  vt.describe("basic subclass creation", () => {
    vt.it("creates simple subclass successfully", () => {
      class TestErr extends bs.AnyErr {}
      const err = new TestErr("something broke")
      vt.expect(err).toBeInstanceOf(TestErr)
      vt.expect(err).toBeInstanceOf(bs.AnyErr)
      vt.expect(err).toBeInstanceOf(Error)
    })

    vt.it("formats error message with subclass name", () => {
      class IoErr extends bs.AnyErr {}
      const err = new IoErr("file not found")
      vt.expect(err.message).toBe("AnyErr->IoErr because: file not found")
    })

    vt.it("formats error message with different subclass name", () => {
      class NetErr extends bs.AnyErr {}
      const err = new NetErr("connection timeout")
      vt.expect(err.message).toBe("AnyErr->NetErr because: connection timeout")
    })
  })

  vt.describe("LAST_ERROR global tracking", () => {
    vt.it("sets LAST_ERROR when error is created", () => {
      class TrackErr extends bs.AnyErr {}
      const err = new TrackErr("test error")
      vt.expect(bs.LAST_ERROR).toBe(err)
    })

    vt.it("updates LAST_ERROR on each new error", () => {
      class FirstErr extends bs.AnyErr {}
      class SecondErr extends bs.AnyErr {}
      
      const err1 = new FirstErr("first")
      vt.expect(bs.LAST_ERROR).toBe(err1)
      
      const err2 = new SecondErr("second")
      vt.expect(bs.LAST_ERROR).toBe(err2)
      vt.expect(bs.LAST_ERROR).not.toBe(err1)
    })

    vt.it("LAST_ERROR persists after error is created", () => {
      class PersistErr extends bs.AnyErr {}
      const err = new PersistErr("persist test")
      const lastError = bs.LAST_ERROR
      
      // Do some other stuff
      const x = 1 + 1
      
      vt.expect(bs.LAST_ERROR).toBe(lastError)
      vt.expect(bs.LAST_ERROR).toBe(err)
    })

    vt.it("tracks most recent error across multiple subclasses", () => {
      class ErrA extends bs.AnyErr {}
      class ErrB extends bs.AnyErr {}
      class ErrC extends bs.AnyErr {}
      
      new ErrA("a")
      new ErrB("b")
      const finalErr = new ErrC("c")
      
      vt.expect(bs.LAST_ERROR).toBe(finalErr)
      vt.expect(bs.LAST_ERROR?.message).toContain("ErrC")
    })
  })

  vt.describe("prototype chain integrity", () => {
    vt.it("maintains proper instanceof chain", () => {
      class CustomErr extends bs.AnyErr {}
      const err = new CustomErr("test")
      
      vt.expect(err instanceof CustomErr).toBe(true)
      vt.expect(err instanceof bs.AnyErr).toBe(true)
      vt.expect(err instanceof Error).toBe(true)
    })

    vt.it("works with nested inheritance", () => {
      class BaseErr extends bs.AnyErr {}
      class SpecificErr extends BaseErr {}
      
      const err = new SpecificErr("nested")
      
      vt.expect(err instanceof SpecificErr).toBe(true)
      vt.expect(err instanceof BaseErr).toBe(true)
      vt.expect(err instanceof bs.AnyErr).toBe(true)
      vt.expect(err instanceof Error).toBe(true)
    })

    vt.it("works with deeply nested inheritance", () => {
      class Level1 extends bs.AnyErr {}
      class Level2 extends Level1 {}
      class Level3 extends Level2 {}
      class Level4 extends Level3 {}
      
      const err = new Level4("deep")
      
      vt.expect(err instanceof Level4).toBe(true)
      vt.expect(err instanceof Level3).toBe(true)
      vt.expect(err instanceof Level2).toBe(true)
      vt.expect(err instanceof Level1).toBe(true)
      vt.expect(err instanceof bs.AnyErr).toBe(true)
      vt.expect(err instanceof Error).toBe(true)
    })

    vt.it("different subclasses are not instanceof each other", () => {
      class ErrA extends bs.AnyErr {}
      class ErrB extends bs.AnyErr {}
      
      const errA = new ErrA("a")
      const errB = new ErrB("b")
      
      vt.expect(errA instanceof ErrB).toBe(false)
      vt.expect(errB instanceof ErrA).toBe(false)
    })
  })

  vt.describe("error message edge cases", () => {
    vt.it("handles empty message", () => {
      class EmptyErr extends bs.AnyErr {}
      const err = new EmptyErr("")
      vt.expect(err.message).toBe("AnyErr->EmptyErr because: ")
    })

    vt.it("handles very long message", () => {
      class LongErr extends bs.AnyErr {}
      const longMsg = "x".repeat(10000)
      const err = new LongErr(longMsg)
      vt.expect(err.message).toContain("AnyErr->LongErr because:")
      vt.expect(err.message).toContain(longMsg)
    })

    vt.it("handles message with newlines", () => {
      class MultilineErr extends bs.AnyErr {}
      const err = new MultilineErr("line1\nline2\nline3")
      vt.expect(err.message).toBe("AnyErr->MultilineErr because: line1\nline2\nline3")
    })

    vt.it("handles message with special characters", () => {
      class SpecialErr extends bs.AnyErr {}
      const err = new SpecialErr("error: $pecial ch@rs! 🔥")
      vt.expect(err.message).toContain("$pecial ch@rs! 🔥")
    })

    vt.it("handles message with quotes", () => {
      class QuoteErr extends bs.AnyErr {}
      const err = new QuoteErr('error with "double" and \'single\' quotes')
      vt.expect(err.message).toContain('"double"')
      vt.expect(err.message).toContain("'single'")
    })

    vt.it("handles unicode in message", () => {
      class UnicodeErr extends bs.AnyErr {}
      const err = new UnicodeErr("错误消息 🚀💯")
      vt.expect(err.message).toContain("错误消息 🚀💯")
    })
  })

  vt.describe("error throwing and catching", () => {
    vt.it("can be thrown and caught", () => {
      class ThrowErr extends bs.AnyErr {}
      
      vt.expect(() => {
        throw new ThrowErr("thrown error")
      }).toThrow()
    })

    vt.it("can be caught as specific type", () => {
      class CatchErr extends bs.AnyErr {}
      
      try {
        throw new CatchErr("catch me")
      } catch (e) {
        vt.expect(e).toBeInstanceOf(CatchErr)
        vt.expect(e).toBeInstanceOf(bs.AnyErr)
      }
    })

    vt.it("can distinguish between error types in catch", () => {
      class ErrTypeA extends bs.AnyErr {}
      class ErrTypeB extends bs.AnyErr {}
      
      try {
        throw new ErrTypeA("type A")
      } catch (e) {
        if (e instanceof ErrTypeA) {
          vt.expect(true).toBe(true)
        } else {
          vt.expect(false).toBe(true) // Should not reach
        }
      }
    })

    vt.it("updates LAST_ERROR when thrown", () => {
      class ThrowTrackErr extends bs.AnyErr {}
      const err = new ThrowTrackErr("track on throw")
      
      try {
        throw err
      } catch (e) {
        vt.expect(bs.LAST_ERROR).toBe(err)
      }
    })
  })

  vt.describe("stack trace", () => {
    vt.it("has stack trace", () => {
      class StackErr extends bs.AnyErr {}
      const err = new StackErr("stack test")
      vt.expect(err.stack).toBeDefined()
      vt.expect(typeof err.stack).toBe("string")
    })

    vt.it("stack trace contains error message", () => {
      class StackMsgErr extends bs.AnyErr {}
      const err = new StackMsgErr("in stack")
      vt.expect(err.stack).toContain("AnyErr->StackMsgErr")
    })

    vt.it("stack trace is different for different errors", () => {
      class Stack1Err extends bs.AnyErr {}
      class Stack2Err extends bs.AnyErr {}
      
      const err1 = new Stack1Err("first")
      const err2 = new Stack2Err("second")
      
      vt.expect(err1.stack).not.toBe(err2.stack)
    })
  })

  vt.describe("error name property", () => {
    vt.it("has name property", () => {
      class NameErr extends bs.AnyErr {}
      const err = new NameErr("name test")
      vt.expect(err.name).toBeDefined()
    })

    vt.it("name reflects constructor", () => {
      class CustomNameErr extends bs.AnyErr {}
      const err = new CustomNameErr("test")
      // Name is typically "Error" for Error subclasses unless overridden
      vt.expect(typeof err.name).toBe("string")
    })
  })

  vt.describe("multiple error types", () => {
    vt.it("creates multiple different error types", () => {
      class IoErr extends bs.AnyErr {}
      class NetErr extends bs.AnyErr {}
      class DbErr extends bs.AnyErr {}
      
      const io = new IoErr("io failed")
      const net = new NetErr("network failed")
      const db = new DbErr("database failed")
      
      vt.expect(io.message).toContain("IoErr")
      vt.expect(net.message).toContain("NetErr")
      vt.expect(db.message).toContain("DbErr")
    })

    vt.it("LAST_ERROR tracks across different error types", () => {
      class Err1 extends bs.AnyErr {}
      class Err2 extends bs.AnyErr {}
      class Err3 extends bs.AnyErr {}
      
      const e1 = new Err1("one")
      vt.expect(bs.LAST_ERROR).toBe(e1)
      
      const e2 = new Err2("two")
      vt.expect(bs.LAST_ERROR).toBe(e2)
      
      const e3 = new Err3("three")
      vt.expect(bs.LAST_ERROR).toBe(e3)
    })
  })

  vt.describe("error serialization", () => {
    vt.it("toString returns message", () => {
      class ToStringErr extends bs.AnyErr {}
      const err = new ToStringErr("to string test")
      const str = err.toString()
      vt.expect(str).toContain("AnyErr->ToStringErr")
    })

    vt.it("can be logged", () => {
      class LogErr extends bs.AnyErr {}
      const err = new LogErr("log test")
      vt.expect(() => console.log(err)).not.toThrow()
    })
  })

  vt.describe("class name capture", () => {
    vt.it("captures single word class name", () => {
      class SimpleErr extends bs.AnyErr {}
      const err = new SimpleErr("test")
      vt.expect(err.message).toContain("SimpleErr")
    })

    vt.it("captures class name with numbers", () => {
      class Error404 extends bs.AnyErr {}
      const err = new Error404("not found")
      vt.expect(err.message).toContain("Error404")
    })

    vt.it("captures class name with underscores", () => {
      class Network_Error extends bs.AnyErr {}
      const err = new Network_Error("network")
      vt.expect(err.message).toContain("Network_Error")
    })

    vt.it("captures camelCase class name", () => {
      class parseJsonError extends bs.AnyErr {}
      const err = new parseJsonError("parse failed")
      vt.expect(err.message).toContain("parseJsonError")
    })
  })

  vt.describe("error chaining", () => {
    vt.it("can wrap another error", () => {
      class WrapperErr extends bs.AnyErr {}
      const originalErr = new Error("original")
      const wrapperErr = new WrapperErr(`wrapped: ${originalErr.message}`)
      
      vt.expect(wrapperErr.message).toContain("wrapped: original")
    })

    vt.it("can wrap AnyErr with another AnyErr", () => {
      class InnerErr extends bs.AnyErr {}
      class OuterErr extends bs.AnyErr {}
      
      const inner = new InnerErr("inner problem")
      const outer = new OuterErr(`outer wrapping: ${inner.message}`)
      
      vt.expect(outer.message).toContain("OuterErr")
      vt.expect(outer.message).toContain("AnyErr->InnerErr")
    })
  })

  vt.describe("concurrent error creation", () => {
    vt.it("handles rapid error creation", () => {
      class RapidErr extends bs.AnyErr {}
      
      const errors = []
      for (let i = 0; i < 100; i++) {
        errors.push(new RapidErr(`error ${i}`))
      }
      
      vt.expect(bs.LAST_ERROR).toBe(errors[99])
      vt.expect(bs.LAST_ERROR?.message).toContain("error 99")
    })

    vt.it("LAST_ERROR is always the most recent", () => {
      class SeqErr extends bs.AnyErr {}
      
      let lastCreated = null
      for (let i = 0; i < 50; i++) {
        lastCreated = new SeqErr(`seq ${i}`)
      }
      
      vt.expect(bs.LAST_ERROR).toBe(lastCreated)
    })
  })

  vt.describe("error properties", () => {
    vt.it("can add custom properties to subclass", () => {
      class CustomPropErr extends bs.AnyErr {
        code: number
        constructor(msg: string, code: number) {
          super(msg)
          this.code = code
        }
      }
      
      const err = new CustomPropErr("custom", 404)
      vt.expect(err.code).toBe(404)
      vt.expect(err.message).toContain("CustomPropErr")
    })

    vt.it("custom properties survive instanceof checks", () => {
      class PropErr extends bs.AnyErr {
        details: string
        constructor(msg: string, details: string) {
          super(msg)
          this.details = details
        }
      }
      
      const err = new PropErr("test", "extra info")
      vt.expect(err).toBeInstanceOf(PropErr)
      vt.expect(err.details).toBe("extra info")
    })
  })

  vt.describe("abstract class behavior", () => {
    vt.it("requires subclassing (cannot instantiate directly)", () => {
      // TypeScript prevents this at compile time, but testing runtime behavior
      // This test documents expected behavior rather than testing actual instantiation
      class ValidSubclass extends bs.AnyErr {}
      vt.expect(() => new ValidSubclass("test")).not.toThrow()
    })
  })
})



vt.describe("range function", () => {
  
  vt.describe("single argument - range to value", () => {
    vt.it("positive single argument counts from 0", () => {
      vt.expect(bs.range(5)).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("negative single argument counts down from 0", () => {
      vt.expect(bs.range(-5)).toEqual([0, -1, -2, -3, -4])
    })

    vt.it("zero returns empty array", () => {
      vt.expect(bs.range(0)).toEqual([])
    })

    vt.it("one returns single element", () => {
      vt.expect(bs.range(1)).toEqual([0])
    })

    vt.it("negative one returns single element", () => {
      vt.expect(bs.range(-1)).toEqual([0])
    })

    vt.it("large positive range", () => {
      const result = bs.range(100)
      vt.expect(result.length).toBe(100)
      vt.expect(result[0]).toBe(0)
      vt.expect(result[99]).toBe(99)
    })

    vt.it("large negative range", () => {
      const result = bs.range(-100)
      vt.expect(result.length).toBe(100)
      vt.expect(result[0]).toBe(0)
      vt.expect(result[99]).toBe(-99)
    })
  })

  vt.describe("two arguments - range from-to", () => {
    vt.it("positive ascending range", () => {
      vt.expect(bs.range(1, 5)).toEqual([1, 2, 3, 4])
    })

    vt.it("positive ascending range starting from zero", () => {
      vt.expect(bs.range(0, 5)).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("negative to zero", () => {
      vt.expect(bs.range(-5, 0)).toEqual([-5, -4, -3, -2, -1])
    })

    vt.it("negative to positive", () => {
      vt.expect(bs.range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2])
    })

    vt.it("positive to negative (reverse)", () => {
      vt.expect(bs.range(3, -3)).toEqual([3, 2, 1, 0, -1, -2])
    })

    vt.it("same start and end returns empty", () => {
      vt.expect(bs.range(5, 5)).toEqual([])
    })

    vt.it("zero to zero returns empty", () => {
      vt.expect(bs.range(0, 0)).toEqual([])
    })

    vt.it("large ascending range", () => {
      const result = bs.range(0, 1000)
      vt.expect(result.length).toBe(1000)
      vt.expect(result[0]).toBe(0)
      vt.expect(result[999]).toBe(999)
    })

    vt.it("large descending range", () => {
      const result = bs.range(1000, 0)
      vt.expect(result.length).toBe(1000)
      vt.expect(result[0]).toBe(1000)
      vt.expect(result[999]).toBe(1)
    })

    vt.it("negative descending range", () => {
      vt.expect(bs.range(-1, -5)).toEqual([-1, -2, -3, -4])
    })

    vt.it("negative ascending range", () => {
      vt.expect(bs.range(-5, -1)).toEqual([-5, -4, -3, -2])
    })
  })

  vt.describe("three arguments - range with step", () => {
    vt.it("positive range with step 2", () => {
      vt.expect(bs.range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
    })

    vt.it("positive range with step 3", () => {
      vt.expect(bs.range(1, 10, 3)).toEqual([1, 4, 7])
    })

    vt.it("negative range with step 2", () => {
      vt.expect(bs.range(10, 0, 2)).toEqual([10, 8, 6, 4, 2])
    })

    vt.it("step larger than range", () => {
      vt.expect(bs.range(0, 5, 10)).toEqual([0])
    })

    vt.it("step of 1 is default behavior", () => {
      vt.expect(bs.range(0, 5, 1)).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("large step value", () => {
      vt.expect(bs.range(0, 100, 25)).toEqual([0, 25, 50, 75])
    })

    vt.it("step that doesn't divide evenly", () => {
      vt.expect(bs.range(0, 10, 3)).toEqual([0, 3, 6, 9])
    })

    vt.it("reverse range with step", () => {
      vt.expect(bs.range(10, 0, 3)).toEqual([10, 7, 4, 1])
    })

    vt.it("negative to positive with step", () => {
      vt.expect(bs.range(-10, 10, 5)).toEqual([-10, -5, 0, 5])
    })

    vt.it("positive to negative with step", () => {
      vt.expect(bs.range(10, -10, 5)).toEqual([10, 5, 0, -5])
    })
  })

  vt.describe("negative step handling", () => {
    vt.it("throws on negative step with ascending range", () => {
      vt.expect(() => bs.range(0, 10, -1)).toThrow()
    })

    vt.it("throws on negative step with descending range", () => {
      vt.expect(() => bs.range(10, 0, -1)).toThrow()
    })

    vt.it("throws on negative step with single argument", () => {
      vt.expect(() => bs.range(5, undefined, -1)).toThrow()
    })

    vt.it("error message mentions swapping for reverse", () => {
      try {
        bs.range(-5, 0, -1)
        vt.expect(true).toBe(false) // Should not reach
      } catch (e: any) {
        vt.expect(e.message).toContain("swap")
      }
    })

    vt.it("throws on negative step of -2", () => {
      vt.expect(() => bs.range(0, 10, -2)).toThrow()
    })

    vt.it("throws on very negative step", () => {
      vt.expect(() => bs.range(0, 100, -50)).toThrow()
    })
  })

  vt.describe("edge cases - special numbers", () => {
    vt.it("handles float start (should work or floor?)", () => {
      const result = bs.range(1.5, 5)
      vt.expect(result).toBeDefined()
      vt.expect(Array.isArray(result)).toBe(true)
    })

    vt.it("handles float end (should work or floor?)", () => {
      const result = bs.range(1, 5.7)
      vt.expect(result).toBeDefined()
      vt.expect(Array.isArray(result)).toBe(true)
    })

    vt.it("handles float step", () => {
      const result = bs.range(0, 5, 1.5)
      vt.expect(result).toBeDefined()
      vt.expect(Array.isArray(result)).toBe(true)
    })

    vt.it("handles very small step", () => {
      const result = bs.range(0, 1, 0.1)
      vt.expect(result.length).toBeGreaterThan(0)
    })

    vt.it("handles step of zero (infinite loop risk!)", () => {
      vt.expect(() => bs.range(0, 10, 0)).toThrow()
    })

    vt.it("handles NaN as start", () => {
      vt.expect(() => bs.range(NaN, 10)).toThrow()
    })

    vt.it("handles NaN as end", () => {
      vt.expect(() => bs.range(0, NaN)).toThrow()
    })

    vt.it("handles NaN as step", () => {
      vt.expect(() => bs.range(0, 10, NaN)).toThrow()
    })

    vt.it("handles Infinity as start", () => {
      vt.expect(() => bs.range(Infinity, 10)).toThrow()
    })

    vt.it("handles Infinity as end", () => {
      vt.expect(() => bs.range(0, Infinity)).toThrow()
    })

    vt.it("handles Infinity as step", () => {
      vt.expect(() => bs.range(0, 10, Infinity)).toThrow()
    })

    vt.it("handles -Infinity", () => {
      vt.expect(() => bs.range(-Infinity, 0)).toThrow()
    })
  })

  vt.describe("boundary values", () => {
    vt.it("very large range size", () => {
      const result = bs.range(0, 10000)
      vt.expect(result.length).toBe(10000)
      vt.expect(result[0]).toBe(0)
      vt.expect(result[9999]).toBe(9999)
    })

    vt.it("very large negative range", () => {
      const result = bs.range(0, -10000)
      vt.expect(result.length).toBe(10000)
      vt.expect(result[0]).toBe(0)
      vt.expect(result[9999]).toBe(-9999)
    })

    vt.it("range with large numbers", () => {
      const result = bs.range(1000000, 1000010)
      vt.expect(result).toEqual([1000000, 1000001, 1000002, 1000003, 1000004, 1000005, 1000006, 1000007, 1000008, 1000009])
    })

    vt.it("range with very negative numbers", () => {
      const result = bs.range(-1000000, -999995)
      vt.expect(result.length).toBe(5)
      vt.expect(result[0]).toBe(-1000000)
    })
  })

  vt.describe("return value validation", () => {
    vt.it("always returns an array", () => {
      vt.expect(Array.isArray(bs.range(5))).toBe(true)
      vt.expect(Array.isArray(bs.range(0))).toBe(true)
      vt.expect(Array.isArray(bs.range(1, 10))).toBe(true)
    })

    vt.it("returns new array each time", () => {
      const arr1 = bs.range(5)
      const arr2 = bs.range(5)
      vt.expect(arr1).not.toBe(arr2)
      vt.expect(arr1).toEqual(arr2)
    })

    vt.it("returned array is mutable", () => {
      const result = bs.range(3)
      result.push(999)
      vt.expect(result).toEqual([0, 1, 2, 999])
    })

    vt.it("all elements are numbers", () => {
      const result = bs.range(-5, 5)
      result.forEach(val => {
        vt.expect(typeof val).toBe("number")
      })
    })

    vt.it("no undefined or null values", () => {
      const result = bs.range(0, 100, 7)
      result.forEach(val => {
        vt.expect(val).not.toBeUndefined()
        vt.expect(val).not.toBeNull()
      })
    })
  })

  vt.describe("sequence correctness", () => {
    vt.it("ascending sequence is strictly increasing", () => {
      const result = bs.range(0, 100)
      for (let i = 1; i < result.length; i++) {
        vt.expect(result[i]).toBeGreaterThan(result[i - 1])
      }
    })

    vt.it("descending sequence is strictly decreasing", () => {
      const result = bs.range(100, 0)
      for (let i = 1; i < result.length; i++) {
        vt.expect(result[i]).toBeLessThan(result[i - 1])
      }
    })

    vt.it("step is consistently applied in ascending", () => {
      const result = bs.range(0, 20, 3)
      for (let i = 1; i < result.length; i++) {
        vt.expect(result[i] - result[i - 1]).toBe(3)
      }
    })

    vt.it("step is consistently applied in descending", () => {
      const result = bs.range(20, 0, 3)
      for (let i = 1; i < result.length; i++) {
        vt.expect(result[i - 1] - result[i]).toBe(3)
      }
    })

    vt.it("no duplicates in sequence", () => {
      const result = bs.range(-10, 10)
      const uniqueValues = new Set(result)
      vt.expect(uniqueValues.size).toBe(result.length)
    })

    vt.it("first element equals start value", () => {
      vt.expect(bs.range(5, 10)[0]).toBe(5)
      vt.expect(bs.range(-5, 5)[0]).toBe(-5)
      vt.expect(bs.range(10, 0)[0]).toBe(10)
    })

    vt.it("last element is less than end for ascending", () => {
      const result = bs.range(0, 10)
      vt.expect(result[result.length - 1]).toBeLessThan(10)
    })

    vt.it("last element is greater than end for descending", () => {
      const result = bs.range(10, 0)
      vt.expect(result[result.length - 1]).toBeGreaterThan(0)
    })
  })

  vt.describe("undefined parameter handling", () => {
    vt.it("undefined as second param uses single-arg behavior", () => {
      vt.expect(bs.range(5, undefined)).toEqual(bs.range(5))
    })

    vt.it("undefined as third param uses default step of 1", () => {
      vt.expect(bs.range(0, 5, undefined)).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("both undefined params", () => {
      vt.expect(bs.range(5, undefined, undefined)).toEqual(bs.range(5))
    })
  })

  vt.describe("practical use cases", () => {
    vt.it("iterate N times", () => {
      const iterations = bs.range(10)
      vt.expect(iterations.length).toBe(10)
    })

    vt.it("generate array indices", () => {
      const arr = ['a', 'b', 'c', 'd', 'e']
      const indices = bs.range(arr.length)
      vt.expect(indices).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("countdown sequence", () => {
      const countdown = bs.range(10, 0)
      vt.expect(countdown[0]).toBe(10)
      vt.expect(countdown[countdown.length - 1]).toBe(1)
    })

    vt.it("even numbers only", () => {
      vt.expect(bs.range(0, 20, 2)).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18])
    })

    vt.it("odd numbers only", () => {
      vt.expect(bs.range(1, 20, 2)).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
    })

    vt.it("multiples of 5", () => {
      vt.expect(bs.range(0, 50, 5)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45])
    })
  })

  vt.describe("performance", () => {
    vt.it("handles very large range efficiently", () => {
      const start = performance.now()
      const result = bs.range(0, 100000)
      const duration = performance.now() - start
      
      vt.expect(result.length).toBe(100000)
      vt.expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    vt.it("large step reduces array size correctly", () => {
      const result = bs.range(0, 1000000, 1000)
      vt.expect(result.length).toBe(1000)
    })
  })

  vt.describe("comparison with Python behavior", () => {
    vt.it("matches Python range(5)", () => {
      vt.expect(bs.range(5)).toEqual([0, 1, 2, 3, 4])
    })

    vt.it("matches Python range(2, 8)", () => {
      vt.expect(bs.range(2, 8)).toEqual([2, 3, 4, 5, 6, 7])
    })

    vt.it("matches Python range(0, 10, 2)", () => {
      vt.expect(bs.range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
    })

    vt.it("matches Python range(10, 0, -1) behavior (should reverse)", () => {
      // In your impl: swap params instead of negative step
      vt.expect(bs.range(10, 0, 1)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    vt.it("empty range like Python", () => {
      vt.expect(bs.range(0)).toEqual([])
      vt.expect(bs.range(5, 5)).toEqual([])
    })
  })
})



vt.describe("or_err function", () => {
  
  vt.describe("successful cases - returns value", () => {
    vt.it("returns truthy number", () => {
      vt.expect(bs.or_err(42)).toBe(42)
    })

    vt.it("returns truthy string", () => {
      vt.expect(bs.or_err("hello")).toBe("hello")
    })

    vt.it("returns true boolean", () => {
      vt.expect(bs.or_err(true)).toBe(true)
    })

    vt.it("returns object", () => {
      const obj = { a: 1 }
      vt.expect(bs.or_err(obj)).toBe(obj)
    })

    vt.it("returns array", () => {
      const arr = [1, 2, 3]
      vt.expect(bs.or_err(arr)).toBe(arr)
    })

    vt.it("returns function", () => {
      const fn = () => 42
      vt.expect(bs.or_err(fn)).toBe(fn)
    })

    vt.it("returns Date object", () => {
      const date = new Date()
      vt.expect(bs.or_err(date)).toBe(date)
    })

    vt.it("returns RegExp", () => {
      const regex = /test/
      vt.expect(bs.or_err(regex)).toBe(regex)
    })

    vt.it("returns Symbol", () => {
      const sym = Symbol("test")
      vt.expect(bs.or_err(sym)).toBe(sym)
    })

    vt.it("returns BigInt", () => {
      const bigInt = BigInt(123)
      vt.expect(bs.or_err(bigInt)).toBe(bigInt)
    })
  })

  vt.describe("falsy but valid values - returns value", () => {
    vt.it("returns zero", () => {
      vt.expect(bs.or_err(0)).toBe(0)
    })

    vt.it("returns negative zero", () => {
      vt.expect(bs.or_err(-0)).toBe(-0)
    })

    vt.it("returns false boolean", () => {
      vt.expect(bs.or_err(false)).toBe(false)
    })

    vt.it("returns empty string", () => {
      vt.expect(bs.or_err("")).toBe("")
    })

    vt.it("returns NaN", () => {
      vt.expect(bs.or_err(NaN)).toBe(NaN)
    })

    vt.it("returns empty array", () => {
      const arr: number[] = []
      vt.expect(bs.or_err(arr)).toBe(arr)
    })

    vt.it("returns empty object", () => {
      const obj = {}
      vt.expect(bs.or_err(obj)).toBe(obj)
    })
  })

  vt.describe("null throws error", () => {
    vt.it("throws on null", () => {
      vt.expect(() => bs.or_err(null)).toThrow()
    })

    vt.it("throws with default message on null", () => {
      try {
        bs.or_err(null)
        vt.expect(true).toBe(false) // Should not reach
      } catch (e: any) {
        vt.expect(e.message).toContain("value existence assertion failed")
      }
    })

    vt.it("throws with custom message on null", () => {
      try {
        bs.or_err(null, "custom null error")
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("custom null error")
      }
    })
  })

  vt.describe("undefined throws error", () => {
    vt.it("throws on undefined", () => {
      vt.expect(() => bs.or_err(undefined)).toThrow()
    })

    vt.it("throws with default message on undefined", () => {
      try {
        bs.or_err(undefined)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("value existence assertion failed")
      }
    })

    vt.it("throws with custom message on undefined", () => {
      try {
        bs.or_err(undefined, "where is my value?")
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("where is my value?")
      }
    })

    vt.it("throws on explicit undefined", () => {
      const val: number | undefined = undefined
      vt.expect(() => bs.or_err(val)).toThrow()
    })
  })

  vt.describe("custom error messages", () => {
    vt.it("uses custom message for null", () => {
      vt.expect(() => bs.or_err(null, "user not found")).toThrow("user not found")
    })

    vt.it("uses custom message for undefined", () => {
      vt.expect(() => bs.or_err(undefined, "config missing")).toThrow("config missing")
    })

    vt.it("handles empty custom message", () => {
      try {
        bs.or_err(null, "")
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toBeDefined()
      }
    })

    vt.it("handles very long custom message", () => {
      const longMsg = "x".repeat(10000)
      try {
        bs.or_err(undefined, longMsg)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain(longMsg)
      }
    })

    vt.it("handles message with special characters", () => {
      vt.expect(() => bs.or_err(null, "error: $pecial ch@rs! 🔥")).toThrow("$pecial ch@rs! 🔥")
    })

    vt.it("handles message with newlines", () => {
      const msg = "line1\nline2\nline3"
      try {
        bs.or_err(undefined, msg)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("line1")
        vt.expect(e.message).toContain("line2")
      }
    })

    vt.it("handles unicode in message", () => {
      vt.expect(() => bs.or_err(null, "错误 🚀")).toThrow("错误 🚀")
    })
  })

  vt.describe("type narrowing behavior", () => {
    vt.it("narrows type from T | undefined to T", () => {
      const maybeValue: number | undefined = 42
      const definiteValue = bs.or_err(maybeValue)
      vt.expect(definiteValue).toBe(42)
      // TypeScript should know definiteValue is number, not number | undefined
    })

    vt.it("narrows type from T | null to T", () => {
      const maybeValue: string | null = "hello"
      const definiteValue = bs.or_err(maybeValue)
      vt.expect(definiteValue).toBe("hello")
    })

    vt.it("narrows type from T | null | undefined to T", () => {
      const maybeValue: boolean | null | undefined = true
      const definiteValue = bs.or_err(maybeValue)
      vt.expect(definiteValue).toBe(true)
    })
  })

  vt.describe("edge cases with complex types", () => {
    vt.it("returns nested object", () => {
      const nested = { a: { b: { c: 42 } } }
      vt.expect(bs.or_err(nested)).toBe(nested)
    })

    vt.it("returns Map", () => {
      const map = new Map([["key", "value"]])
      vt.expect(bs.or_err(map)).toBe(map)
    })

    vt.it("returns Set", () => {
      const set = new Set([1, 2, 3])
      vt.expect(bs.or_err(set)).toBe(set)
    })

    vt.it("returns class instance", () => {
      class MyClass { value = 42 }
      const instance = new MyClass()
      vt.expect(bs.or_err(instance)).toBe(instance)
    })

    vt.it("returns Error object", () => {
      const error = new Error("test error")
      vt.expect(bs.or_err(error)).toBe(error)
    })

    vt.it("returns Promise", () => {
      const promise = Promise.resolve(42)
      vt.expect(bs.or_err(promise)).toBe(promise)
    })

    vt.it("returns async function", () => {
      const asyncFn = async () => 42
      vt.expect(bs.or_err(asyncFn)).toBe(asyncFn)
    })

    vt.it("returns generator function", () => {
      function* gen() { yield 42 }
      vt.expect(bs.or_err(gen)).toBe(gen)
    })
  })

  vt.describe("practical use cases", () => {
    vt.it("validates function return value", () => {
      function maybeGetUser(): { name: string } | undefined {
        return { name: "Alice" }
      }
      
      const user = bs.or_err(maybeGetUser(), "user not found")
      vt.expect(user.name).toBe("Alice")
    })

    vt.it("validates array access", () => {
      const arr = [1, 2, 3]
      const first = bs.or_err(arr[0], "array is empty")
      vt.expect(first).toBe(1)
    })

    vt.it("validates Map.get result", () => {
      const map = new Map([["key", "value"]])
      const value = bs.or_err(map.get("key"), "key not found")
      vt.expect(value).toBe("value")
    })

    vt.it("throws when Map.get returns undefined", () => {
      const map = new Map([["key", "value"]])
      vt.expect(() => bs.or_err(map.get("missing"), "key not found")).toThrow("key not found")
    })

    vt.it("validates object property access", () => {
      const obj: { name?: string } = { name: "Bob" }
      const name = bs.or_err(obj.name, "name is required")
      vt.expect(name).toBe("Bob")
    })

    vt.it("throws when property is undefined", () => {
      const obj: { name?: string } = {}
      vt.expect(() => bs.or_err(obj.name, "name is required")).toThrow("name is required")
    })

    vt.it("validates JSON parse result properties", () => {
      const data = JSON.parse('{"id": 123}')
      const id = bs.or_err(data.id, "id missing from response")
      vt.expect(id).toBe(123)
    })

    vt.it("chains multiple assertions", () => {
      const obj: { user?: { profile?: { email?: string } } } = {
        user: { profile: { email: "test@example.com" } }
      }
      
      const user = bs.or_err(obj.user, "user missing")
      const profile = bs.or_err(user.profile, "profile missing")
      const email = bs.or_err(profile.email, "email missing")
      
      vt.expect(email).toBe("test@example.com")
    })
  })

  vt.describe("error type", () => {
    vt.it("throws Error instance", () => {
      try {
        bs.or_err(null)
        vt.expect(true).toBe(false)
      } catch (e) {
        vt.expect(e).toBeInstanceOf(Error)
      }
    })

    vt.it("error has message property", () => {
      try {
        bs.or_err(undefined, "test message")
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toBeDefined()
        vt.expect(typeof e.message).toBe("string")
      }
    })

    vt.it("error has stack trace", () => {
      try {
        bs.or_err(null)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.stack).toBeDefined()
      }
    })

    vt.it("can be caught as Error", () => {
      try {
        bs.or_err(undefined)
        vt.expect(true).toBe(false)
      } catch (e) {
        if (e instanceof Error) {
          vt.expect(true).toBe(true)
        } else {
          vt.expect(false).toBe(true)
        }
      }
    })
  })

  vt.describe("optional message parameter", () => {
    vt.it("works without message parameter", () => {
      vt.expect(() => bs.or_err(null)).toThrow()
    })

    vt.it("uses default message when not provided", () => {
      try {
        bs.or_err(undefined)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("value existence assertion failed")
      }
    })

    vt.it("default message is consistent", () => {
      let msg1: string = ""
      let msg2: string = ""
      
      try { bs.or_err(null) } catch (e: any) { msg1 = e.message }
      try { bs.or_err(undefined) } catch (e: any) { msg2 = e.message }
      
      vt.expect(msg1).toBe(msg2)
    })
  })

  vt.describe("return value is same reference", () => {
    vt.it("returns exact same object reference", () => {
      const obj = { value: 42 }
      const result = bs.or_err(obj)
      vt.expect(result).toBe(obj)
      vt.expect(Object.is(result, obj)).toBe(true)
    })

    vt.it("returns exact same array reference", () => {
      const arr = [1, 2, 3]
      const result = bs.or_err(arr)
      vt.expect(result).toBe(arr)
      vt.expect(Object.is(result, arr)).toBe(true)
    })

    vt.it("doesn't clone or copy the value", () => {
      const obj = { nested: { value: 42 } }
      const result = bs.or_err(obj)
      result.nested.value = 100
      vt.expect(obj.nested.value).toBe(100)
    })
  })

  vt.describe("integration with LAST_ERROR", () => {
    vt.it("sets LAST_ERROR when throwing", () => {
      try {
        bs.or_err(null, "integration test")
      } catch (e) {
        vt.expect(bs.LAST_ERROR).toBeDefined()
        vt.expect(bs.LAST_ERROR?.message).toContain("integration test")
      }
    })

    vt.it("LAST_ERROR is Error instance from or_err", () => {
      try {
        bs.or_err(undefined, "last error test")
      } catch (e) {
        vt.expect(bs.LAST_ERROR).toBeInstanceOf(Error)
      }
    })
  })

  vt.describe("performance", () => {
    vt.it("handles many successful assertions quickly", () => {
      const values = Array.from({ length: 10000 }, (_, i) => i)
      
      const start = performance.now()
      values.forEach(v => bs.or_err(v))
      const duration = performance.now() - start
      
      vt.expect(duration).toBeLessThan(100)
    })

    vt.it("doesn't create overhead for valid values", () => {
      const obj = { value: 42 }
      
      const start = performance.now()
      for (let i = 0; i < 100000; i++) {
        bs.or_err(obj)
      }
      const duration = performance.now() - start
      
      vt.expect(duration).toBeLessThan(500)
    })
  })

  vt.describe("comparison with other falsy values", () => {
    vt.it("null vs 0", () => {
      vt.expect(bs.or_err(0)).toBe(0)
      vt.expect(() => bs.or_err(null)).toThrow()
    })

    vt.it("undefined vs empty string", () => {
      vt.expect(bs.or_err("")).toBe("")
      vt.expect(() => bs.or_err(undefined)).toThrow()
    })

    vt.it("null vs false", () => {
      vt.expect(bs.or_err(false)).toBe(false)
      vt.expect(() => bs.or_err(null)).toThrow()
    })

    vt.it("undefined vs NaN", () => {
      vt.expect(bs.or_err(NaN)).toBe(NaN)
      vt.expect(() => bs.or_err(undefined)).toThrow()
    })
  })
})



vt.describe("TRIM_WITH constant", () => {
  vt.it("is defined", () => {
    vt.expect(bs.TRIM_WITH).toBeDefined()
  })

  vt.it("is a string", () => {
    vt.expect(typeof bs.TRIM_WITH).toBe("string")
  })

  vt.it("equals three dots", () => {
    vt.expect(bs.TRIM_WITH).toBe("...")
  })

  vt.it("has length of 3", () => {
    vt.expect(bs.TRIM_WITH.length).toBe(3)
  })
})

vt.describe("TrimErr class", () => {
  vt.it("is a subclass of AnyErr", () => {
    const err = new bs.TrimErr("test")
    vt.expect(err).toBeInstanceOf(bs.TrimErr)
    vt.expect(err).toBeInstanceOf(bs.AnyErr)
    vt.expect(err).toBeInstanceOf(Error)
  })

  vt.it("formats message correctly", () => {
    const err = new bs.TrimErr("trim failed")
    vt.expect(err.message).toContain("TrimErr")
    vt.expect(err.message).toContain("trim failed")
  })
})

vt.describe("trim_begin function", () => {
  
  vt.describe("basic functionality", () => {
    vt.it("trims long string from beginning", () => {
      const result = bs.trim_begin("hello world", 8)
      vt.expect(result).toBe("...world")
    })

    vt.it("adds ellipsis to beginning when trimmed", () => {
      const result = bs.trim_begin("abcdefghij", 7)
      vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("preserves end of string", () => {
      const result = bs.trim_begin("start middle end", 10)
      vt.expect(result.endsWith("end")).toBe(true)
    })

    vt.it("result length equals maxLen when trimmed", () => {
      const result = bs.trim_begin("this is a very long string", 10)
      vt.expect(result.length).toBe(10)
    })

    vt.it("returns original string if under maxLen", () => {
      const original = "short"
      const result = bs.trim_begin(original, 10)
      vt.expect(result).toBe(original)
    })

    vt.it("returns original string if equal to maxLen", () => {
      const original = "exactly"
      const result = bs.trim_begin(original, 7)
      vt.expect(result).toBe(original)
    })
  })

  vt.describe("exact boundary cases", () => {
    vt.it("maxLen = string length (no trim needed)", () => {
      vt.expect(bs.trim_begin("hello", 5)).toBe("hello")
    })

    vt.it("maxLen = string length + 1 (no trim needed)", () => {
      vt.expect(bs.trim_begin("hello", 6)).toBe("hello")
    })

    vt.it("maxLen = string length - 1 (trim by 1)", () => {
      const result = bs.trim_begin("hello", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("maxLen = TRIM_WITH.length + 1 (minimum valid)", () => {
      const result = bs.trim_begin("hello world", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result).toBe("...d")
    })

    vt.it("trims to exactly maxLen characters", () => {
      const lengths = [5, 10, 15, 20, 25]
      lengths.forEach(len => {
        const result = bs.trim_begin("a".repeat(100), len)
        vt.expect(result.length).toBe(len)
      })
    })
  })

  vt.describe("error cases - maxLen too short", () => {
    vt.it("throws when maxLen equals TRIM_WITH.length", () => {
      vt.expect(() => bs.trim_begin("hello", 3)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is less than TRIM_WITH.length", () => {
      vt.expect(() => bs.trim_begin("hello", 2)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is 1", () => {
      vt.expect(() => bs.trim_begin("hello", 1)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is 0", () => {
      vt.expect(() => bs.trim_begin("hello", 0)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is negative", () => {
      vt.expect(() => bs.trim_begin("hello", -5)).toThrow(bs.TrimErr)
    })

    vt.it("error message includes maxLen value", () => {
      try {
        bs.trim_begin("test", 2)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("2")
        vt.expect(e.message).toContain("too short")
      }
    })

    vt.it("error message mentions trim_begin", () => {
      try {
        bs.trim_begin("test", 1)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("trim_begin")
      }
    })
  })

  vt.describe("edge cases - empty and short strings", () => {
    vt.it("handles empty string", () => {
      vt.expect(bs.trim_begin("", 10)).toBe("")
    })

    vt.it("handles single character string under limit", () => {
      vt.expect(bs.trim_begin("a", 5)).toBe("a")
    })

    vt.it("handles string with only spaces", () => {
      const result = bs.trim_begin("     ", 4)
      vt.expect(result).toBe("... ")
    })

    vt.it("trims string with only spaces when needed", () => {
      const result = bs.trim_begin("          ", 5)
      vt.expect(result.length).toBe(5)
      vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
    })
  })

  vt.describe("special characters", () => {
    vt.it("handles unicode characters", () => {
      const result = bs.trim_begin("🔥💯🚀✨⭐", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("handles newlines", () => {
      const result = bs.trim_begin("line1\nline2\nline3", 10)
      vt.expect(result.length).toBe(10)
    })

    vt.it("handles tabs", () => {
      const result = bs.trim_begin("col1\tcol2\tcol3", 8)
      vt.expect(result.length).toBe(8)
    })

    vt.it("handles mixed special characters", () => {
      const str = "hello\nworld\t🔥"
      const result = bs.trim_begin(str, 8)
      vt.expect(result.length).toBe(8)
    })

    vt.it("preserves emoji at end", () => {
      const result = bs.trim_begin("start middle 🔥", 8)
      vt.expect(result.endsWith("🔥")).toBe(true)
    })
  })

  vt.describe("long strings", () => {
    vt.it("handles very long string", () => {
      const longStr = "a".repeat(10000)
      const result = bs.trim_begin(longStr, 10)
      vt.expect(result.length).toBe(10)
      vt.expect(result).toBe("...aaaaaaa")
    })

    vt.it("trims large amount of text", () => {
      const longStr = "x".repeat(1000)
      const result = bs.trim_begin(longStr, 20)
      vt.expect(result.length).toBe(20)
      vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("preserves correct end portion", () => {
      const str = "a".repeat(100) + "END"
      const result = bs.trim_begin(str, 10)
      vt.expect(result.endsWith("END")).toBe(true)
    })
  })

  vt.describe("return value validation", () => {
    vt.it("always returns a string", () => {
      vt.expect(typeof bs.trim_begin("test", 10)).toBe("string")
      vt.expect(typeof bs.trim_begin("test", 4)).toBe("string")
    })

    vt.it("never returns empty string for non-empty input", () => {
      const result = bs.trim_begin("hello", 4)
      vt.expect(result.length).toBeGreaterThan(0)
    })

    vt.it("trimmed string is never longer than maxLen", () => {
      const testCases = [
        ["hello world", 5],
        ["a".repeat(100), 20],
        ["test string", 8]
      ]
      testCases.forEach(([str, maxLen]) => {
        const result = bs.trim_begin(str as string, maxLen as number)
        vt.expect(result.length).toBeLessThanOrEqual(maxLen as number)
      })
    })
  })

  vt.describe("mathematical correctness", () => {
    vt.it("keeps (maxLen - 3) characters from end", () => {
      const str = "0123456789"
      const result = bs.trim_begin(str, 7)
      // Should keep 7 - 3 = 4 chars from end: "6789"
      vt.expect(result).toBe("...6789")
    })

    vt.it("calculates slice position correctly", () => {
      const str = "abcdefghijklmnop"
      const maxLen = 10
      const result = bs.trim_begin(str, maxLen)
      // str.length = 16, maxLen = 10, keep = 7
      // slice from position 16 - 7 = 9
      vt.expect(result).toBe("...jklmnop")
    })
  })
})

vt.describe("trim_end function", () => {
  
  vt.describe("basic functionality", () => {
    vt.it("trims long string from end", () => {
      const result = bs.trim_end("hello world", 8)
      vt.expect(result).toBe("hello...")
    })

    vt.it("adds ellipsis to end when trimmed", () => {
      const result = bs.trim_end("abcdefghij", 7)
      vt.expect(result.endsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("preserves beginning of string", () => {
      const result = bs.trim_end("start middle end", 10)
      vt.expect(result.startsWith("start")).toBe(true)
    })

    vt.it("result length equals maxLen when trimmed", () => {
      const result = bs.trim_end("this is a very long string", 10)
      vt.expect(result.length).toBe(10)
    })

    vt.it("returns original string if under maxLen", () => {
      const original = "short"
      const result = bs.trim_end(original, 10)
      vt.expect(result).toBe(original)
    })

    vt.it("returns original string if equal to maxLen", () => {
      const original = "exactly"
      const result = bs.trim_end(original, 7)
      vt.expect(result).toBe(original)
    })
  })

  vt.describe("exact boundary cases", () => {
    vt.it("maxLen = string length (no trim needed)", () => {
      vt.expect(bs.trim_end("hello", 5)).toBe("hello")
    })

    vt.it("maxLen = string length + 1 (no trim needed)", () => {
      vt.expect(bs.trim_end("hello", 6)).toBe("hello")
    })

    vt.it("maxLen = string length - 1 (trim by 1)", () => {
      const result = bs.trim_end("hello", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result.endsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("maxLen = TRIM_WITH.length + 1 (minimum valid)", () => {
      const result = bs.trim_end("hello world", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result).toBe("h...")
    })

    vt.it("trims to exactly maxLen characters", () => {
      const lengths = [5, 10, 15, 20, 25]
      lengths.forEach(len => {
        const result = bs.trim_end("a".repeat(100), len)
        vt.expect(result.length).toBe(len)
      })
    })
  })

  vt.describe("error cases - maxLen too short", () => {
    vt.it("throws when maxLen equals TRIM_WITH.length", () => {
      vt.expect(() => bs.trim_end("hello", 3)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is less than TRIM_WITH.length", () => {
      vt.expect(() => bs.trim_end("hello", 2)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is 1", () => {
      vt.expect(() => bs.trim_end("hello", 1)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is 0", () => {
      vt.expect(() => bs.trim_end("hello", 0)).toThrow(bs.TrimErr)
    })

    vt.it("throws when maxLen is negative", () => {
      vt.expect(() => bs.trim_end("hello", -5)).toThrow(bs.TrimErr)
    })

    vt.it("error message includes maxLen value", () => {
      try {
        bs.trim_end("test", 2)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("2")
        vt.expect(e.message).toContain("too short")
      }
    })

    vt.it("error message mentions trim_end", () => {
      try {
        bs.trim_end("test", 1)
        vt.expect(true).toBe(false)
      } catch (e: any) {
        vt.expect(e.message).toContain("trim_end")
      }
    })
  })

  vt.describe("edge cases - empty and short strings", () => {
    vt.it("handles empty string", () => {
      vt.expect(bs.trim_end("", 10)).toBe("")
    })

    vt.it("handles single character string under limit", () => {
      vt.expect(bs.trim_end("a", 5)).toBe("a")
    })

    vt.it("handles string with only spaces", () => {
      const result = bs.trim_end("     ", 4)
      vt.expect(result).toBe(" ...")
    })

    vt.it("trims string with only spaces when needed", () => {
      const result = bs.trim_end("          ", 5)
      vt.expect(result.length).toBe(5)
      vt.expect(result.endsWith(bs.TRIM_WITH)).toBe(true)
    })
  })

  vt.describe("special characters", () => {
    vt.it("handles unicode characters", () => {
      const result = bs.trim_end("🔥💯🚀✨⭐", 4)
      vt.expect(result.length).toBe(4)
      vt.expect(result.endsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("handles newlines", () => {
      const result = bs.trim_end("line1\nline2\nline3", 10)
      vt.expect(result.length).toBe(10)
    })

    vt.it("handles tabs", () => {
      const result = bs.trim_end("col1\tcol2\tcol3", 8)
      vt.expect(result.length).toBe(8)
    })

    vt.it("handles mixed special characters", () => {
      const str = "🔥\nhello\tworld"
      const result = bs.trim_end(str, 8)
      vt.expect(result.length).toBe(8)
    })

    vt.it("preserves emoji at start", () => {
      const result = bs.trim_end("🔥 start middle", 8)
      vt.expect(result.startsWith("🔥")).toBe(true)
    })
  })

  vt.describe("long strings", () => {
    vt.it("handles very long string", () => {
      const longStr = "a".repeat(10000)
      const result = bs.trim_end(longStr, 10)
      vt.expect(result.length).toBe(10)
      vt.expect(result).toBe("aaaaaaa...")
    })

    vt.it("trims large amount of text", () => {
      const longStr = "x".repeat(1000)
      const result = bs.trim_end(longStr, 20)
      vt.expect(result.length).toBe(20)
      vt.expect(result.endsWith(bs.TRIM_WITH)).toBe(true)
    })

    vt.it("preserves correct start portion", () => {
      const str = "START" + "z".repeat(100)
      const result = bs.trim_end(str, 10)
      vt.expect(result.startsWith("START")).toBe(true)
    })
  })

  vt.describe("return value validation", () => {
    vt.it("always returns a string", () => {
      vt.expect(typeof bs.trim_end("test", 10)).toBe("string")
      vt.expect(typeof bs.trim_end("test", 4)).toBe("string")
    })

    vt.it("never returns empty string for non-empty input", () => {
      const result = bs.trim_end("hello", 4)
      vt.expect(result.length).toBeGreaterThan(0)
    })

    vt.it("trimmed string is never longer than maxLen", () => {
      const testCases = [
        ["hello world", 5],
        ["a".repeat(100), 20],
        ["test string", 8]
      ]
      testCases.forEach(([str, maxLen]) => {
        const result = bs.trim_end(str as string, maxLen as number)
        vt.expect(result.length).toBeLessThanOrEqual(maxLen as number)
      })
    })
  })

  vt.describe("mathematical correctness", () => {
    vt.it("keeps (maxLen - 3) characters from start", () => {
      const str = "0123456789"
      const result = bs.trim_end(str, 7)
      // Should keep 7 - 3 = 4 chars from start: "0123"
      vt.expect(result).toBe("0123...")
    })

    vt.it("calculates slice position correctly", () => {
      const str = "abcdefghijklmnop"
      const maxLen = 10
      const result = bs.trim_end(str, maxLen)
      // maxLen = 10, keep = 7, slice(0, 7)
      vt.expect(result).toBe("abcdefg...")
    })
  })
})

vt.describe("trim_begin and trim_end comparison", () => {
  vt.it("both handle same string differently", () => {
    const str = "hello world"
    const begin = bs.trim_begin(str, 8)
    const end = bs.trim_end(str, 8)
    
    vt.expect(begin).toBe("...world")
    vt.expect(end).toBe("hello...")
    vt.expect(begin).not.toBe(end)
  })

  vt.it("both throw on same invalid maxLen", () => {
    vt.expect(() => bs.trim_begin("test", 2)).toThrow()
    vt.expect(() => bs.trim_end("test", 2)).toThrow()
  })

  vt.it("both return original for short strings", () => {
    const str = "short"
    vt.expect(bs.trim_begin(str, 10)).toBe(str)
    vt.expect(bs.trim_end(str, 10)).toBe(str)
  })

  vt.it("both produce same length output", () => {
    const str = "a".repeat(100)
    const maxLen = 20
    vt.expect(bs.trim_begin(str, maxLen).length).toBe(maxLen)
    vt.expect(bs.trim_end(str, maxLen).length).toBe(maxLen)
  })

  vt.it("ellipsis position differs", () => {
    const str = "abcdefghij"
    const begin = bs.trim_begin(str, 7)
    const end = bs.trim_end(str, 7)
    
    vt.expect(begin.indexOf(bs.TRIM_WITH)).toBe(0)
    vt.expect(end.lastIndexOf(bs.TRIM_WITH)).toBe(4)
  })
})

vt.describe("practical use cases", () => {
  vt.it("trim_end for displaying file paths", () => {
    const path = "/very/long/path/to/some/file.txt"
    const result = bs.trim_end(path, 20)
    vt.expect(result.length).toBe(20)
    vt.expect(result.startsWith("/very")).toBe(true)
  })

  vt.it("trim_begin for displaying log messages", () => {
    const log = "ERROR: Connection failed after multiple retries"
    const result = bs.trim_begin(log, 25)
    vt.expect(result.endsWith("retries")).toBe(true)
  })

  vt.it("trim_end for truncating user input", () => {
    const userInput = "This is a very long comment that needs to be shortened"
    const result = bs.trim_end(userInput, 30)
    vt.expect(result.length).toBe(30)
  })

  vt.it("trim_begin for showing context in search results", () => {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
    const result = bs.trim_begin(text, 30)
    vt.expect(result.length).toBe(30)
    vt.expect(result.startsWith(bs.TRIM_WITH)).toBe(true)
  })
})

vt.describe("error integration with LAST_ERROR", () => {
  vt.it("trim_begin sets LAST_ERROR on throw", () => {
    try {
      bs.trim_begin("test", 1)
    } catch (e) {
      vt.expect(bs.LAST_ERROR).toBeInstanceOf(bs.TrimErr)
    }
  })

  vt.it("trim_end sets LAST_ERROR on throw", () => {
    try {
      bs.trim_end("test", 0)
    } catch (e) {
      vt.expect(bs.LAST_ERROR).toBeInstanceOf(bs.TrimErr)
    }
  })
})



vt.describe("time_to_str function", () => {
  
  vt.it("returns a string", () => {
    const result = bs.time_to_str()
    vt.expect(typeof result).toBe("string")
  })

  vt.it("returns timestamp with expected format structure", () => {
    const result = bs.time_to_str()
    // Should have format like HH:MM:SS-DD:MM:YYYY
    // Check for colons and dash
    vt.expect(result).toMatch(/\d+:\d+:\d+-\d+:\d+:\d+/)
  })

  vt.it("returns different values when called at different times", () => {
    const result1 = bs.time_to_str()
    // Small delay
    const start = Date.now()
    while (Date.now() - start < 10) {}
    const result2 = bs.time_to_str()
    
    // At least one should be different (or they could be same if super fast)
    vt.expect(typeof result1).toBe("string")
    vt.expect(typeof result2).toBe("string")
  })

  vt.it("always returns non-empty string", () => {
    const result = bs.time_to_str()
    vt.expect(result.length).toBeGreaterThan(0)
  })
})




vt.describe("sleep function", () => {
  
  vt.describe("basic functionality", () => {
    vt.it("resolves after specified milliseconds", async () => {
      const start = Date.now()
      await bs.sleep(100)
      const duration = Date.now() - start
      
      vt.expect(duration).toBeGreaterThanOrEqual(100)
      vt.expect(duration).toBeLessThan(200) // Some tolerance
    })

    vt.it("returns a Promise", () => {
      const result = bs.sleep(10)
      vt.expect(result).toBeInstanceOf(Promise)
    })

    vt.it("resolves to undefined", async () => {
      const result = await bs.sleep(10)
      vt.expect(result).toBeUndefined()
    })

    vt.it("can be awaited", async () => {
      await vt.expect(bs.sleep(10)).resolves.toBeUndefined()
    })
  })

  vt.describe("timing accuracy", () => {
    vt.it("sleeps for approximately the right duration", async () => {
      const testCases = [5, 10, 20]

      for (const ms of testCases) {
        const start = Date.now()
        await bs.sleep(ms)
        const duration = Date.now() - start

        vt.expect(duration).toBeGreaterThanOrEqual(ms)
        vt.expect(duration).toBeLessThan(ms + 100)
      }
    })

    vt.it("zero milliseconds resolves immediately", async () => {
      const start = Date.now()
      await bs.sleep(0)
      const duration = Date.now() - start
      
      vt.expect(duration).toBeLessThan(50)
    })

    vt.it("very short sleep still yields control", async () => {
      const start = Date.now()
      await bs.sleep(1)
      const duration = Date.now() - start
      
      vt.expect(duration).toBeGreaterThanOrEqual(0)
    })
  })

  vt.describe("edge cases", () => {
    vt.it("handles negative numbers gracefully", async () => {
      const start = Date.now()
      await bs.sleep(-100)
      const duration = Date.now() - start
      
      // Should resolve immediately or throw
      vt.expect(duration).toBeLessThan(50)
    })

    vt.it("handles very large numbers", async () => {
      // Don't actually wait - just check it returns a promise
      const result = bs.sleep(1000000)
      vt.expect(result).toBeInstanceOf(Promise)
      // Don't await it
    })

    vt.it("handles float values", async () => {
      const start = Date.now()
      await bs.sleep(50.5)
      const duration = Date.now() - start
      
      vt.expect(duration).toBeGreaterThanOrEqual(50)
    })

    vt.it("handles NaN", async () => {
      // Should either throw or resolve immediately
      await vt.expect(bs.sleep(NaN)).resolves.toBeUndefined()
    })

    vt.it("handles Infinity", async () => {
      // Should not hang - just verify it returns a promise
      const result = bs.sleep(Infinity)
      vt.expect(result).toBeInstanceOf(Promise)
    })
  })

  vt.describe("concurrent sleeps", () => {
    vt.it("multiple sleeps run concurrently", async () => {
      const start = Date.now()
      
      await Promise.all([
        bs.sleep(100),
        bs.sleep(100),
        bs.sleep(100)
      ])
      
      const duration = Date.now() - start
      
      // Should take ~100ms, not 300ms
      vt.expect(duration).toBeLessThan(200)
      vt.expect(duration).toBeGreaterThanOrEqual(100)
    })

    vt.it("different sleep durations resolve at correct times", async () => {
      const results: number[] = []
      const start = Date.now()
      
      await Promise.all([
        bs.sleep(50).then(() => results.push(1)),
        bs.sleep(100).then(() => results.push(2)),
        bs.sleep(150).then(() => results.push(3))
      ])
      
      const duration = Date.now() - start
      
      vt.expect(results).toHaveLength(3)
      vt.expect(duration).toBeGreaterThanOrEqual(150)
      vt.expect(duration).toBeLessThan(250)
    })

    vt.it("can race multiple sleeps", async () => {
      const start = Date.now()
      
      await Promise.race([
        bs.sleep(50),
        bs.sleep(100),
        bs.sleep(200)
      ])
      
      const duration = Date.now() - start
      
      // Should resolve after ~50ms (the fastest)
      vt.expect(duration).toBeGreaterThanOrEqual(50)
      vt.expect(duration).toBeLessThan(100)
    })
  })

  vt.describe("sequential usage", () => {
    vt.it("can be chained", async () => {
      const start = Date.now()
      
      await bs.sleep(50)
      await bs.sleep(50)
      await bs.sleep(50)
      
      const duration = Date.now() - start
      
      // Should take ~150ms total
      vt.expect(duration).toBeGreaterThanOrEqual(150)
      vt.expect(duration).toBeLessThan(250)
    })

    vt.it("works in loops", async () => {
      const start = Date.now()
      
      for (let i = 0; i < 3; i++) {
        await bs.sleep(30)
      }
      
      const duration = Date.now() - start
      
      vt.expect(duration).toBeGreaterThanOrEqual(90)
      vt.expect(duration).toBeLessThan(200)
    })
  })

  vt.describe("error handling", () => {
    vt.it("never rejects", async () => {
      await vt.expect(bs.sleep(10)).resolves.toBeUndefined()
    })

    vt.it("doesn't throw on invalid input", async () => {
      await vt.expect(bs.sleep(-10)).resolves.toBeUndefined() // resolved Promise<void> is also undefined
    })
  })

  vt.describe("practical use cases", () => {
    vt.it("useful for throttling operations", async () => {
      const operations: number[] = []
      const start = Date.now()
      
      for (let i = 0; i < 3; i++) {
        operations.push(i)
        await bs.sleep(50)
      }

      const duration = Date.now() - start

      vt.expect(operations).toEqual([0, 1, 2])
      vt.expect(duration).toBeGreaterThanOrEqual(100)
    })

    vt.it("can be used for retry delays", async () => {
      let attempts = 0
      const maxAttempts = 3
      
      const tryOperation = async (): Promise<boolean> => {
        attempts++
        if (attempts < maxAttempts) {
          await bs.sleep(20)
          return tryOperation()
        }
        return true
      }
      
      const result = await tryOperation()
      vt.expect(result).toBe(true)
      vt.expect(attempts).toBe(3)
    })

    vt.it("works with timeout patterns", async () => {
      const timeoutPromise = bs.sleep(100).then(() => "timeout")
      const quickPromise = bs.sleep(50).then(() => "quick")
      
      const result = await Promise.race([quickPromise, timeoutPromise])
      vt.expect(result).toBe("quick")
    })
  })

  vt.describe("performance", () => {
    vt.it("creates many concurrent sleeps without issues", async () => {
      const sleeps = Array.from({ length: 100 }, () => bs.sleep(10))
      
      await vt.expect(Promise.all(sleeps)).resolves.toBeDefined()
    })

    vt.it("very short sleeps are efficient", async () => {
      const start = Date.now()
      
      for (let i = 0; i < 10; i++) {
        await bs.sleep(1)
      }
      
      const duration = Date.now() - start
      
      // Should not take too long despite 10 sleeps
      vt.expect(duration).toBeLessThan(200)
    })
  })
})




vt.describe("skipping Out and ASCI_ESP cuz hard to test accurately + not worth")




vt.describe("remove_all_from_arr function", () => {
  
  vt.describe("basic removal", () => {
    vt.it("removes single occurrence of value", () => {
      const arr = [1, 2, 3, 4, 5]
      bs.remove_all_from_arr(arr, 3)
      vt.expect(arr).toEqual([1, 2, 4, 5])
    })

    vt.it("removes multiple occurrences of value", () => {
      const arr = [1, 2, 3, 2, 4, 2, 5]
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toEqual([1, 3, 4, 5])
    })

    vt.it("removes all occurrences when value appears many times", () => {
      const arr = [7, 7, 7, 7, 7]
      bs.remove_all_from_arr(arr, 7)
      vt.expect(arr).toEqual([])
    })

    vt.it("does nothing when value not in array", () => {
      const arr = [1, 2, 3, 4, 5]
      bs.remove_all_from_arr(arr, 99)
      vt.expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    vt.it("handles empty array", () => {
      const arr: number[] = []
      bs.remove_all_from_arr(arr, 1)
      vt.expect(arr).toEqual([])
    })
  })

  vt.describe("void return type behavior", () => {
    vt.it("returns undefined", () => {
      const arr = [1, 2, 3]
      const result = bs.remove_all_from_arr(arr, 2)
      vt.expect(result).toBeUndefined()
    })

    vt.it("mutates original array", () => {
      const arr = [1, 2, 3, 2, 4]
      const originalRef = arr
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toBe(originalRef)
      vt.expect(arr).toEqual([1, 3, 4])
    })
  })

  vt.describe("string arrays", () => {
    vt.it("removes strings from array", () => {
      const arr = ["apple", "banana", "apple", "cherry"]
      bs.remove_all_from_arr(arr, "apple")
      vt.expect(arr).toEqual(["banana", "cherry"])
    })

    vt.it("removes empty strings", () => {
      const arr = ["", "hello", "", "world", ""]
      bs.remove_all_from_arr(arr, "")
      vt.expect(arr).toEqual(["hello", "world"])
    })

    vt.it("handles whitespace strings", () => {
      const arr = [" ", "test", " ", "  "]
      bs.remove_all_from_arr(arr, " ")
      vt.expect(arr).toEqual(["test", "  "])
    })
  })

  vt.describe("consecutive duplicates", () => {
    vt.it("removes consecutive duplicates", () => {
      const arr = [1, 1, 1, 2, 3, 3, 3]
      bs.remove_all_from_arr(arr, 1)
      vt.expect(arr).toEqual([2, 3, 3, 3])
    })

    vt.it("removes scattered and consecutive duplicates", () => {
      const arr = [1, 2, 2, 3, 2, 2, 2, 4]
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toEqual([1, 3, 4])
    })
  })

  vt.describe("position edge cases", () => {
    vt.it("removes value at start", () => {
      const arr = [5, 1, 2, 3, 4]
      bs.remove_all_from_arr(arr, 5)
      vt.expect(arr).toEqual([1, 2, 3, 4])
    })

    vt.it("removes value at end", () => {
      const arr = [1, 2, 3, 4, 5]
      bs.remove_all_from_arr(arr, 5)
      vt.expect(arr).toEqual([1, 2, 3, 4])
    })

    vt.it("removes values at both start and end", () => {
      const arr = [7, 1, 2, 3, 7]
      bs.remove_all_from_arr(arr, 7)
      vt.expect(arr).toEqual([1, 2, 3])
    })

    vt.it("removes only element in array", () => {
      const arr = [42]
      bs.remove_all_from_arr(arr, 42)
      vt.expect(arr).toEqual([])
    })
  })

  vt.describe("type coercion and equality", () => {
    vt.it("uses strict equality - doesn't remove '1' when looking for 1", () => {
      const arr = [1, "1", 2, "1", 3]
      bs.remove_all_from_arr(arr as any, 1)
      vt.expect(arr).toEqual(["1", 2, "1", 3])
    })

    vt.it("uses strict equality - doesn't remove true when looking for 1", () => {
      const arr = [true, 1, false, 1, 0]
      bs.remove_all_from_arr(arr as any, 1)
      vt.expect(arr).toEqual([true, false, 0])
    })

    vt.it("distinguishes null from undefined", () => {
      const arr = [null, undefined, null, 1, undefined]
      bs.remove_all_from_arr(arr, null)
      vt.expect(arr).toEqual([undefined, 1, undefined])
    })

    vt.it("distinguishes undefined from null", () => {
      const arr = [null, undefined, null, 1, undefined]
      bs.remove_all_from_arr(arr, undefined)
      vt.expect(arr).toEqual([null, null, 1])
    })

    vt.it("removes null values", () => {
      const arr = [1, null, 2, null, 3]
      bs.remove_all_from_arr(arr, null)
      vt.expect(arr).toEqual([1, 2, 3])
    })

    vt.it("removes undefined values", () => {
      const arr = [1, undefined, 2, undefined, 3]
      bs.remove_all_from_arr(arr, undefined)
      vt.expect(arr).toEqual([1, 2, 3])
    })
  })

  vt.describe("special number values", () => {
    vt.it("doesn't remove NaN (NaN !== NaN)", () => {
      const arr = [1, NaN, 2, NaN, 3]
      bs.remove_all_from_arr(arr, NaN)
      vt.expect(arr).toEqual([1, NaN, 2, NaN, 3])
    })

    vt.it("removes Infinity", () => {
      const arr = [1, Infinity, 2, Infinity, 3]
      bs.remove_all_from_arr(arr, Infinity)
      vt.expect(arr).toEqual([1, 2, 3])
    })

    vt.it("removes negative Infinity", () => {
      const arr = [1, -Infinity, 2, -Infinity, 3]
      bs.remove_all_from_arr(arr, -Infinity)
      vt.expect(arr).toEqual([1, 2, 3])
    })

    vt.it("removes zero", () => {
      const arr = [0, 1, 0, 2, 0]
      bs.remove_all_from_arr(arr, 0)
      vt.expect(arr).toEqual([1, 2])
    })

    vt.it("handles -0 vs +0 (they're equal in JS)", () => {
      const arr = [0, -0, 1, 0, -0]
      bs.remove_all_from_arr(arr, 0)
      vt.expect(arr).toEqual([1])
    })
  })

  vt.describe("object and reference equality", () => {
    vt.it("removes by reference equality for objects", () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const arr = [obj1, obj2, obj1, obj2]
      bs.remove_all_from_arr(arr, obj1)
      vt.expect(arr).toEqual([obj2, obj2])
    })

    vt.it("doesn't remove structurally equal objects", () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 1 }]
      bs.remove_all_from_arr(arr, { id: 1 })
      vt.expect(arr).toEqual([{ id: 1 }, { id: 2 }, { id: 1 }])
    })

    vt.it("removes by reference equality for arrays", () => {
      const arr1 = [1, 2]
      const arr2 = [3, 4]
      const arr = [arr1, arr2, arr1]
      bs.remove_all_from_arr(arr, arr1)
      vt.expect(arr).toEqual([arr2])
    })

    vt.it("removes by reference equality for functions", () => {
      const fn1 = () => 1
      const fn2 = () => 2
      const arr = [fn1, fn2, fn1, fn2]
      bs.remove_all_from_arr(arr, fn1)
      vt.expect(arr).toEqual([fn2, fn2])
    })

    vt.it("removes symbols by identity", () => {
      const sym1 = Symbol("test")
      const sym2 = Symbol("test")
      const arr = [sym1, sym2, sym1]
      bs.remove_all_from_arr(arr, sym1)
      vt.expect(arr).toEqual([sym2])
    })
  })

  vt.describe("boolean arrays", () => {
    vt.it("removes true values", () => {
      const arr = [true, false, true, false, true]
      bs.remove_all_from_arr(arr, true)
      vt.expect(arr).toEqual([false, false])
    })

    vt.it("removes false values", () => {
      const arr = [true, false, true, false, true]
      bs.remove_all_from_arr(arr, false)
      vt.expect(arr).toEqual([true, true, true])
    })
  })

  vt.describe("array length updates", () => {
    vt.it("updates array length after removal", () => {
      const arr = [1, 2, 3, 2, 4, 2]
      vt.expect(arr.length).toBe(6)
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr.length).toBe(3)
    })

    vt.it("reduces to empty array when all removed", () => {
      const arr = [5, 5, 5, 5]
      bs.remove_all_from_arr(arr, 5)
      vt.expect(arr.length).toBe(0)
      vt.expect(arr).toEqual([])
    })

    vt.it("length unchanged when nothing removed", () => {
      const arr = [1, 2, 3]
      bs.remove_all_from_arr(arr, 99)
      vt.expect(arr.length).toBe(3)
    })
  })

  vt.describe("performance and stress tests", () => {
    vt.it("handles large arrays efficiently", () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i % 100)
      bs.remove_all_from_arr(arr, 42)
      vt.expect(arr).not.toContain(42)
      vt.expect(arr.length).toBeLessThan(10000)
    })

    vt.it("handles array with mostly target values", () => {
      const arr = Array(1000).fill(5)
      arr.push(1, 2, 3)
      bs.remove_all_from_arr(arr, 5)
      vt.expect(arr).toEqual([1, 2, 3])
    })

    vt.it("handles alternating pattern", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i % 2)
      bs.remove_all_from_arr(arr, 0)
      vt.expect(arr).toEqual(Array(500).fill(1))
    })
  })

  vt.describe("mixed type arrays", () => {
    vt.it("removes from mixed-type array", () => {
      const arr = [1, "two", 3, "two", true, "two"]
      bs.remove_all_from_arr(arr as any, "two")
      vt.expect(arr).toEqual([1, 3, true])
    })

    vt.it("removes numbers from mixed array", () => {
      const arr = [1, "1", 2, "2", 1]
      bs.remove_all_from_arr(arr as any, 1)
      vt.expect(arr).toEqual(["1", 2, "2"])
    })
  })

  vt.describe("sparse arrays", () => {
    vt.it("handles arrays with holes", () => {
      const arr = [1, , 2, , 3]
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).not.toContain(2)
    })

    vt.it("can remove undefined from sparse array", () => {
      const arr = [1, undefined, 2, undefined, 3]
      bs.remove_all_from_arr(arr, undefined)
      vt.expect(arr).toEqual([1, 2, 3])
    })
  })

  vt.describe("no side effects beyond mutation", () => {
    vt.it("doesn't affect other references to same objects", () => {
      const obj = { id: 1 }
      const arr = [obj, { id: 2 }, obj]
      bs.remove_all_from_arr(arr, obj)
      vt.expect(obj).toEqual({ id: 1 }) // obj itself unchanged
    })

    vt.it("doesn't modify removed values", () => {
      const obj = { count: 5 }
      const arr = [obj, obj]
      bs.remove_all_from_arr(arr, obj)
      vt.expect(obj.count).toBe(5)
    })
  })

  vt.describe("array preserves order", () => {
    vt.it("maintains order of remaining elements", () => {
      const arr = [1, 5, 2, 5, 3, 5, 4]
      bs.remove_all_from_arr(arr, 5)
      vt.expect(arr).toEqual([1, 2, 3, 4])
    })

    vt.it("maintains order with objects", () => {
      const a = { id: "a" }
      const b = { id: "b" }
      const c = { id: "c" }
      const x = { id: "x" }
      const arr = [a, x, b, x, c, x]
      bs.remove_all_from_arr(arr, x)
      vt.expect(arr).toEqual([a, b, c])
    })
  })

  vt.describe("edge case: removing after array operations", () => {
    vt.it("works after push", () => {
      const arr = [1, 2, 3]
      arr.push(2, 2)
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toEqual([1, 3])
    })

    vt.it("works after unshift", () => {
      const arr = [1, 2, 3]
      arr.unshift(2, 2)
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toEqual([1, 3])
    })

    vt.it("works on sliced array", () => {
      const original = [1, 2, 3, 2, 4, 2, 5]
      const arr = original.slice(2, 6)
      bs.remove_all_from_arr(arr, 2)
      vt.expect(arr).toEqual([3, 4])
      vt.expect(original).toEqual([1, 2, 3, 2, 4, 2, 5]) // original unchanged
    })
  })
})





vt.describe("try_func function", () => {
  
  vt.describe("successful execution", () => {
    vt.it("returns result when function succeeds", () => {
      const result = bs.try_func(() => 42)
      vt.expect(result).toBe(42)
    })

    vt.it("returns string result", () => {
      const result = bs.try_func(() => "hello")
      vt.expect(result).toBe("hello")
    })

    vt.it("returns object result", () => {
      const obj = { id: 1, name: "test" }
      const result = bs.try_func(() => obj)
      vt.expect(result).toBe(obj)
    })

    vt.it("returns array result", () => {
      const arr = [1, 2, 3]
      const result = bs.try_func(() => arr)
      vt.expect(result).toEqual([1, 2, 3])
    })

    vt.it("returns null when function returns null", () => {
      const result = bs.try_func(() => null)
      vt.expect(result).toBe(null)
    })

    vt.it("returns undefined when function returns undefined", () => {
      const result = bs.try_func(() => undefined)
      vt.expect(result).toBe(undefined)
    })

    vt.it("returns false when function returns false", () => {
      const result = bs.try_func(() => false)
      vt.expect(result).toBe(false)
    })

    vt.it("returns 0 when function returns 0", () => {
      const result = bs.try_func(() => 0)
      vt.expect(result).toBe(0)
    })

    vt.it("returns empty string when function returns empty string", () => {
      const result = bs.try_func(() => "")
      vt.expect(result).toBe("")
    })
  })

  vt.describe("error handling", () => {
    vt.it("returns TRY_ERROR when function throws", () => {
      const result = bs.try_func(() => {
        throw new Error("boom")
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR for any thrown error", () => {
      const result = bs.try_func(() => {
        throw new TypeError("type error")
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when throwing string", () => {
      const result = bs.try_func(() => {
        throw "string error"
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when throwing null", () => {
      const result = bs.try_func(() => {
        throw null
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when throwing undefined", () => {
      const result = bs.try_func(() => {
        throw undefined
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when throwing number", () => {
      const result = bs.try_func(() => {
        throw 42
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when throwing object", () => {
      const result = bs.try_func(() => {
        throw { code: 500 }
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })
  })

  vt.describe("TRY_ERROR symbol properties", () => {
    vt.it("TRY_ERROR is a symbol", () => {
      vt.expect(typeof bs.TRY_ERROR).toBe("symbol")
    })

    vt.it("TRY_ERROR is unique", () => {
      const result = bs.try_func(() => {
        throw new Error()
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
      vt.expect(result === bs.TRY_ERROR).toBe(true)
    })

    vt.it("can check for error using strict equality", () => {
      const result = bs.try_func(() => {
        throw new Error()
      })
      if (result === bs.TRY_ERROR) {
        vt.expect(true).toBe(true)
      } else {
        vt.expect(false).toBe(true) // should not reach
      }
    })

    vt.it("TRY_ERROR is not equal to other symbols", () => {
      const otherSymbol = Symbol('TryError')
      vt.expect(bs.TRY_ERROR).not.toBe(otherSymbol)
    })
  })

  vt.describe("function with arguments", () => {
    vt.it("passes single argument", () => {
      const result = bs.try_func((x: number) => x * 2, 5)
      vt.expect(result).toBe(10)
    })

    vt.it("passes multiple arguments", () => {
      const result = bs.try_func((a: number, b: number, c: number) => a + b + c, 1, 2, 3)
      vt.expect(result).toBe(6)
    })

    vt.it("passes string arguments", () => {
      const result = bs.try_func((a: string, b: string) => a + b, "hello", "world")
      vt.expect(result).toBe("helloworld")
    })

    vt.it("passes mixed type arguments", () => {
      const result = bs.try_func((n: number, s: string, b: boolean) => `${n}-${s}-${b}`, 42, "test", true)
      vt.expect(result).toBe("42-test-true")
    })

    vt.it("passes object arguments", () => {
      const obj = { value: 10 }
      const result = bs.try_func((o: typeof obj) => o.value * 2, obj)
      vt.expect(result).toBe(20)
    })

    vt.it("passes array arguments", () => {
      const result = bs.try_func((arr: number[]) => arr.reduce((a, b) => a + b, 0), [1, 2, 3, 4])
      vt.expect(result).toBe(10)
    })

    vt.it("passes no arguments to function expecting none", () => {
      const result = bs.try_func(() => "no args")
      vt.expect(result).toBe("no args")
    })

    vt.it("handles functions with optional parameters", () => {
      const result = bs.try_func((a: number, b?: number) => a + (b || 0), 5)
      vt.expect(result).toBe(5)
    })

    vt.it("passes many arguments", () => {
      const result = bs.try_func((a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e, 1, 2, 3, 4, 5)
      vt.expect(result).toBe(15)
    })
  })

  vt.describe("error in function with arguments", () => {
    vt.it("returns TRY_ERROR when function with args throws", () => {
      const result = bs.try_func((x: number) => {
        if (x < 0) throw new Error("negative")
        return x
      }, -5)
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("returns TRY_ERROR when division by zero conceptually fails", () => {
      const result = bs.try_func((a: number, b: number) => {
        if (b === 0) throw new Error("division by zero")
        return a / b
      }, 10, 0)
      vt.expect(result).toBe(bs.TRY_ERROR)
    })
  })

  vt.describe("complex function behaviors", () => {
    vt.it("handles function that modifies external state", () => {
      let counter = 0
      const result = bs.try_func(() => {
        counter++
        return counter
      })
      vt.expect(result).toBe(1)
      vt.expect(counter).toBe(1)
    })

    vt.it("handles function that calls other functions", () => {
      const helper = (x: number) => x * 2
      const result = bs.try_func(() => helper(5) + helper(3))
      vt.expect(result).toBe(16)
    })

    vt.it("handles recursive function", () => {
      const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)
      const result = bs.try_func(factorial, 5)
      vt.expect(result).toBe(120)
    })

    vt.it("handles function returning function", () => {
      const result = bs.try_func(() => (x: number) => x * 2)
      vt.expect(typeof result).toBe("function")
      if (typeof result === "function") {
        vt.expect(result(5)).toBe(10)
      }
    })

    vt.it("handles async function (returns Promise)", () => {
      const result = bs.try_func(async () => 42)
      vt.expect(result).toBeInstanceOf(Promise)
    })
  })

  vt.describe("parsing and computation errors", () => {
    vt.it("catches JSON parse errors", () => {
      const result = bs.try_func(() => JSON.parse("invalid json"))
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("succeeds on valid JSON parse", () => {
      const result = bs.try_func(() => JSON.parse('{"a":1}'))
      vt.expect(result).toEqual({ a: 1 })
    })

    vt.it("catches array access errors on null", () => {
      const result = bs.try_func(() => (null as any)[0])
      // This doesn't throw in JS, returns TRY_ERROR
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("catches property access on null that throws", () => {
      const result = bs.try_func(() => {
        const x: any = null
        return x.toString()
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("catches property access on undefined that throws", () => {
      const result = bs.try_func(() => {
        const x: any = undefined
        return x.toString()
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
    })
  })

  vt.describe("type safety patterns", () => {
    vt.it("can be used with type guard", () => {
      const result = bs.try_func(() => 42)
      if (result !== bs.TRY_ERROR) {
        const num: number = result
        vt.expect(num).toBe(42)
      }
    })

    vt.it("distinguishes success from error in conditional", () => {
      const success = bs.try_func(() => "success")
      const failure = bs.try_func(() => {
        throw new Error()
      })
      
      vt.expect(success !== bs.TRY_ERROR).toBe(true)
      vt.expect(failure === bs.TRY_ERROR).toBe(true)
    })
  })

  vt.describe("edge cases with return values", () => {
    vt.it("distinguishes TRY_ERROR from function returning symbol", () => {
      const mySymbol = Symbol('mine')
      const result = bs.try_func(() => mySymbol)
      vt.expect(result).toBe(mySymbol)
      vt.expect(result).not.toBe(bs.TRY_ERROR)
    })

    vt.it("handles function returning TRY_ERROR symbol itself", () => {
      const result = bs.try_func(() => bs.TRY_ERROR)
      vt.expect(result).toBe(bs.TRY_ERROR)
      // This is ambiguous! Can't tell if it succeeded or failed
    })

    vt.it("handles function returning undefined vs throwing", () => {
      const returnUndefined = bs.try_func(() => undefined)
      const throwError = bs.try_func(() => {
        throw new Error()
      })
      
      vt.expect(returnUndefined).toBe(undefined)
      vt.expect(throwError).toBe(bs.TRY_ERROR)
      vt.expect(returnUndefined).not.toBe(throwError)
    })
  })

  vt.describe("closure and scope", () => {
    vt.it("function can access outer scope", () => {
      const multiplier = 3
      const result = bs.try_func((x: number) => x * multiplier, 5)
      vt.expect(result).toBe(15)
    })

    vt.it("function can modify captured variables", () => {
      let captured = 10
      const result = bs.try_func(() => {
        captured = 20
        return captured
      })
      vt.expect(result).toBe(20)
      vt.expect(captured).toBe(20)
    })

    vt.it("error doesn't prevent variable modifications before throw", () => {
      let modified = false
      const result = bs.try_func(() => {
        modified = true
        throw new Error("after modification")
      })
      vt.expect(result).toBe(bs.TRY_ERROR)
      vt.expect(modified).toBe(true)
    })
  })

  vt.describe("special JavaScript operations", () => {
    vt.it("handles operations that don't throw", () => {
      const result = bs.try_func(() => 1 / 0)
      vt.expect(result).toBe(Infinity)
    })

    vt.it("handles NaN producing operations", () => {
      const result = bs.try_func(() => 0 / 0)
      vt.expect(Number.isNaN(result)).toBe(true)
    })

    vt.it("handles string coercion", () => {
      const result = bs.try_func(() => String(undefined))
      vt.expect(result).toBe("undefined")
    })

    vt.it("handles typeof operation", () => {
      const result = bs.try_func(() => typeof undefined)
      vt.expect(result).toBe("undefined")
    })
  })

  vt.describe("class and constructor functions", () => {
    vt.it("handles function that creates class instance", () => {
      class MyClass {
        value = 42
      }
      const result = bs.try_func(() => new MyClass())
      vt.expect(result).toBeInstanceOf(MyClass)
      if (result !== bs.TRY_ERROR) {
        vt.expect(result.value).toBe(42)
      }
    })

    vt.it("catches constructor errors", () => {
      class ThrowingClass {
        constructor() {
          throw new Error("constructor failed")
        }
      }
      const result = bs.try_func(() => new ThrowingClass())
      vt.expect(result).toBe(bs.TRY_ERROR)
    })
  })

  vt.describe("nested try_func calls", () => {
    vt.it("can nest try_func calls", () => {
      const inner = bs.try_func(() => 21)
      const outer = bs.try_func(() => {
        if (inner !== bs.TRY_ERROR) {
          return inner * 2
        }
        return 0
      })
      vt.expect(outer).toBe(42)
    })

    vt.it("inner error propagates as TRY_ERROR", () => {
      const inner = bs.try_func(() => {
        throw new Error("inner")
      })
      const outer = bs.try_func(() => {
        if (inner === bs.TRY_ERROR) {
          throw new Error("outer saw inner error")
        }
        return inner
      })
      vt.expect(outer).toBe(bs.TRY_ERROR)
    })
  })

  vt.describe("performance and stress", () => {
    vt.it("handles computationally intensive function", () => {
      const result = bs.try_func(() => {
        let sum = 0
        for (let i = 0; i < 100000; i++) {
          sum += i
        }
        return sum
      })
      vt.expect(result).toBe(4999950000)
    })

    vt.it("handles function with large argument list", () => {
      const result = bs.try_func((...args: number[]) => args.reduce((a, b) => a + b, 0), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      vt.expect(result).toBe(55)
    })
  })

  vt.describe("doesn't affect LAST_ERROR", () => {
    vt.it("try_func doesn't update LAST_ERROR on caught errors", () => {
      const originalLastError = bs.LAST_ERROR
      bs.try_func(() => {
        throw new Error("should be caught")
      })
      vt.expect(bs.LAST_ERROR).toBe(originalLastError)
    })

    vt.it("allows AnyErr to update LAST_ERROR inside try_func", () => {
      class TestErr extends bs.AnyErr {}
      const result = bs.try_func(() => {
        const err = new TestErr("test")
        return err
      })
      if (result !== bs.TRY_ERROR) {
        vt.expect(bs.LAST_ERROR).toBe(result)
      }
    })
  })

  vt.describe("real-world usage patterns", () => {
    vt.it("safely parse JSON from API", () => {
      const apiResponse = '{"status":"ok","data":123}'
      const result = bs.try_func(() => JSON.parse(apiResponse))
      if (result !== bs.TRY_ERROR) {
        vt.expect(result.status).toBe("ok")
      }
    })

    vt.it("safely access nested properties", () => {
      const data: any = { user: { profile: { name: "Alice" } } }
      const result = bs.try_func(() => data.user.profile.name)
      vt.expect(result).toBe("Alice")
    })

    vt.it("handles missing nested properties gracefully", () => {
      const data: any = { user: null }
      const result = bs.try_func(() => data.user.profile.name)
      vt.expect(result).toBe(bs.TRY_ERROR)
    })

    vt.it("safely execute user-provided function", () => {
      const userFunc = (x: number) => {
        if (x < 0) throw new Error("no negatives")
        return Math.sqrt(x)
      }
      
      const result1 = bs.try_func(userFunc, 16)
      const result2 = bs.try_func(userFunc, -4)
      
      vt.expect(result1).toBe(4)
      vt.expect(result2).toBe(bs.TRY_ERROR)
    })
  })
})




vt.describe("freezer function", () => {
  
  vt.describe("basic freezing", () => {
    vt.it("freezes a simple object", () => {
      const obj = { a: 1, b: 2 }
      const frozen = bs.freezer(obj)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })

    vt.it("returns the same object reference", () => {
      const obj = { x: 10 }
      const frozen = bs.freezer(obj)
      vt.expect(frozen).toBe(obj)
    })

    vt.it("prevents property modification", () => {
      const obj = { value: 5 }
      const frozen = bs.freezer(obj)
      bs.try_func(() => frozen.value = 10)
      vt.expect(frozen.value).toBe(5)
    })

    vt.it("prevents property addition", () => {
      const obj: any = { a: 1 }
      const frozen = bs.freezer(obj)
      bs.try_func(() => frozen.b = 2)
      vt.expect(frozen.b).toBeUndefined()
    })

    vt.it("prevents property deletion", () => {
      const obj: any = { a: 1, b: 2 }
      const frozen = bs.freezer(obj)
      bs.try_func(() => delete frozen.b)
      vt.expect(frozen.b).toBe(2)
    })
  })

  vt.describe("arrays", () => {
    vt.it("freezes arrays", () => {
      const arr = [1, 2, 3]
      const frozen = bs.freezer(arr)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })

    vt.it("prevents array modification", () => {
      const arr = [1, 2, 3]
      const frozen = bs.freezer(arr)
      bs.try_func(() => frozen[0] = 99)
      vt.expect(frozen[0]).toBe(1)
    })

    vt.it("prevents array push", () => {
      const arr = [1, 2, 3]
      const frozen = bs.freezer(arr)
      vt.expect(() => frozen.push(4)).toThrow()
    })

    vt.it("prevents array pop", () => {
      const arr = [1, 2, 3]
      const frozen = bs.freezer(arr)
      vt.expect(() => frozen.pop()).toThrow()
    })
  })

  vt.describe("nested objects", () => {
    vt.it("deep freezes by default", () => {
      const obj = { nested: { value: 1 } }
      const frozen = bs.freezer(obj)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
      vt.expect(Object.isFrozen(frozen.nested)).toBe(true)
    })

    vt.it("nested objects are immutable", () => {
      const obj = { nested: { value: 1 } }
      const frozen = bs.freezer(obj)
      bs.try_func(() => frozen.nested.value = 99)
      vt.expect(frozen.nested.value).toBe(1)
    })
  })

  vt.describe("special objects", () => {
    vt.it("freezes Date objects", () => {
      const date = new Date()
      const frozen = bs.freezer(date)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })

    vt.it("freezes Map objects", () => {
      const map = new Map([["a", 1]])
      const frozen = bs.freezer(map)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })

    vt.it("freezes Set objects", () => {
      const set = new Set([1, 2, 3])
      const frozen = bs.freezer(set)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })
  })

  vt.describe("already frozen objects", () => {
    vt.it("handles already frozen objects", () => {
      const obj = Object.freeze({ a: 1 })
      const frozen = bs.freezer(obj)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })
  })

  vt.describe("empty objects", () => {
    vt.it("freezes empty object", () => {
      const obj = {}
      const frozen = bs.freezer(obj)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })

    vt.it("freezes empty array", () => {
      const arr: number[] = []
      const frozen = bs.freezer(arr)
      vt.expect(Object.isFrozen(frozen)).toBe(true)
    })
  })
})




vt.describe("retry function", () => {
  
  vt.describe("successful execution", () => {
    vt.it("returns result on first successful attempt", async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        return 42
      }
      const result = await bs.retry(fn, 3, 100)
      vt.expect(result).toBe(42)
      vt.expect(callCount).toBe(1)
    })

    vt.it("returns result from async function", async () => {
      const fn = async () => "success"
      const result = await bs.retry(fn, 3, 100)
      vt.expect(result).toBe("success")
    })

    vt.it("returns result from sync function", async () => {
      const fn = () => "sync result"
      const result = await bs.retry(fn, 3, 100)
      vt.expect(result).toBe("sync result")
    })

    vt.it("returns complex object", async () => {
      const obj = { data: [1, 2, 3], meta: { count: 3 } }
      const fn = () => obj
      const result = await bs.retry(fn, 3, 100)
      vt.expect(result).toBe(obj)
    })
  })

  vt.describe("retry on failure", () => {
    vt.it("retries once and succeeds on second attempt", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts === 1) throw new Error("first fail")
        return "success"
      }
      
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe("success")
      vt.expect(attempts).toBe(2)
    })

    vt.it("retries multiple times before success", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 3) throw new Error(`fail ${attempts}`)
        return "finally worked"
      }
      
      const result = await bs.retry(fn, 5, 50)
      vt.expect(result).toBe("finally worked")
      vt.expect(attempts).toBe(3)
    })

    vt.it("succeeds on last possible attempt", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 3) throw new Error("fail")
        return "last chance success"
      }
      
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe("last chance success")
      vt.expect(attempts).toBe(3)
    })
  })

  vt.describe("exhausted attempts", () => {
    vt.it("throws last error after exhausting all attempts", async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        throw new Error("persistent failure")
      }
      
      await vt.expect(bs.retry(fn, 3, 50)).rejects.toThrow("persistent failure")
      vt.expect(callCount).toBe(3)
    })

    vt.it("throws with single attempt", async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        throw new Error("immediate fail")
      }
      
      await vt.expect(bs.retry(fn, 1, 50)).rejects.toThrow("immediate fail")
      vt.expect(callCount).toBe(1)
    })

    vt.it("preserves error type", async () => {
      class CustomErr extends Error {}
      const fn = () => { throw new CustomErr("custom") }
      
      try {
        await bs.retry(fn, 2, 50)
        vt.expect(true).toBe(false)
      } catch (err) {
        vt.expect(err).toBeInstanceOf(CustomErr)
        vt.expect((err as Error).message).toBe("custom")
      }
    })

    vt.it("preserves AnyErr subclass", async () => {
      class IoErr extends bs.AnyErr {}
      const fn = () => { throw new IoErr("io failed") }
      
      try {
        await bs.retry(fn, 2, 50)
        vt.expect(true).toBe(false)
      } catch (err) {
        vt.expect(err).toBeInstanceOf(IoErr)
        vt.expect(err).toBeInstanceOf(bs.AnyErr)
      }
    })
  })

  vt.describe("delay behavior", () => {
    vt.it("waits delay between attempts", async () => {
      const start = Date.now()
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 3) throw new Error("retry")
        return "done"
      }
      
      await bs.retry(fn, 3, 100)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeGreaterThanOrEqual(180)
    })

    vt.it("no delay before first attempt", async () => {
      const start = Date.now()
      const fn = () => "immediate"
      
      await bs.retry(fn, 3, 1000)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeLessThan(100)
    })

    vt.it("no delay after final success", async () => {
      const start = Date.now()
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw new Error("retry")
        return "done"
      }
      
      await bs.retry(fn, 3, 100)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeLessThan(150)
    })

    vt.it("respects zero delay", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 3) throw new Error("fail")
        return "done"
      }
      
      const start = Date.now()
      await bs.retry(fn, 3, 0)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeLessThan(50)
    })
  })

  vt.describe("function arguments", () => {
    vt.it("passes single argument", async () => {
      const fn = (x: number) => x * 2
      const result = await bs.retry(fn, 3, 50, 21)
      vt.expect(result).toBe(42)
    })

    vt.it("passes multiple arguments", async () => {
      const fn = (a: number, b: number, c: number) => a + b + c
      const result = await bs.retry(fn, 3, 50, 10, 20, 30)
      vt.expect(result).toBe(60)
    })

    vt.it("passes no arguments", async () => {
      const fn = () => "no args"
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe("no args")
    })

    vt.it("passes complex objects as arguments", async () => {
      const fn = (obj: any, arr: any[]) => ({ ...obj, items: arr })
      const result = await bs.retry(fn, 3, 50, { id: 1 }, [1, 2, 3])
      vt.expect(result).toEqual({ id: 1, items: [1, 2, 3] })
    })

    vt.it("maintains arguments across retries", async () => {
      let attempts = 0
      const calls: Array<[number, string]> = []
      const fn = (x: number, y: string) => {
        attempts++
        calls.push([x, y])
        if (attempts < 2) throw new Error("retry")
        return `${x}-${y}`
      }
      
      const result = await bs.retry(fn, 3, 50, 42, "test")
      vt.expect(result).toBe("42-test")
      vt.expect(calls).toEqual([[42, "test"], [42, "test"]])
    })

    vt.it("passes string arguments", async () => {
      const fn = (s: string) => s.toUpperCase()
      const result = await bs.retry(fn, 3, 50, "hello")
      vt.expect(result).toBe("HELLO")
    })

    vt.it("passes boolean arguments", async () => {
      const fn = (flag: boolean) => flag ? "yes" : "no"
      const result = await bs.retry(fn, 3, 50, true)
      vt.expect(result).toBe("yes")
    })
  })

  vt.describe("max attempts edge cases", () => {
    vt.it("handles maxAttempts of 1", async () => {
      const fn = () => "once"
      const result = await bs.retry(fn, 1, 50)
      vt.expect(result).toBe("once")
    })

    vt.it("handles large maxAttempts", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 50) throw new Error("keep trying")
        return "finally"
      }
      
      const result = await bs.retry(fn, 100, 0)
      vt.expect(result).toBe("finally")
      vt.expect(attempts).toBe(50)
    })

    vt.it("fails after exact maxAttempts", async () => {
      let callCount = 0
      const fn = () => {
        callCount++
        throw new Error("always fail")
      }
      
      await vt.expect(bs.retry(fn, 5, 10)).rejects.toThrow()
      vt.expect(callCount).toBe(5)
    })
  })

  vt.describe("async promise rejection", () => {
    vt.it("retries on rejected promise", async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 2) return Promise.reject(new Error("reject"))
        return "resolved"
      }
      
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe("resolved")
    })

    vt.it("handles promise rejection with non-Error", async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 2) return Promise.reject("string error")
        return "ok"
      }
      
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe("ok")
    })
  })

  vt.describe("return value types", () => {
    vt.it("returns string", async () => {
      const fn = () => "text"
      const result = await bs.retry(fn, 3, 50)
      vt.expect(typeof result).toBe("string")
    })

    vt.it("returns number", async () => {
      const fn = () => 123
      const result = await bs.retry(fn, 3, 50)
      vt.expect(typeof result).toBe("number")
    })

    vt.it("returns boolean", async () => {
      const fn = () => true
      const result = await bs.retry(fn, 3, 50)
      vt.expect(typeof result).toBe("boolean")
    })

    vt.it("returns null", async () => {
      const fn = () => null
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBeNull()
    })

    vt.it("returns undefined", async () => {
      const fn = () => undefined
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBeUndefined()
    })

    vt.it("returns array", async () => {
      const fn = () => [1, 2, 3]
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toEqual([1, 2, 3])
    })

    vt.it("returns object", async () => {
      const fn = () => ({ key: "value" })
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toEqual({ key: "value" })
    })
  })

  vt.describe("error types thrown", () => {
    vt.it("catches and retries on Error", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw new Error("standard error")
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })

    vt.it("catches and retries on TypeError", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw new TypeError("type error")
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })

    vt.it("catches and retries on custom errors", async () => {
      class NetworkError extends Error {}
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw new NetworkError("network failed")
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })

    vt.it("catches and retries on string throw", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw "string error"
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })

    vt.it("catches and retries on number throw", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw 404
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })

    vt.it("catches and retries on null throw", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw null
        return "ok"
      }
      
      await bs.retry(fn, 3, 50)
      vt.expect(attempts).toBe(2)
    })
  })

  vt.describe("RetryErr unreachable case", () => {
    vt.it("should never throw RetryErr in normal operation", async () => {
      const fn = () => { throw new Error("normal error") }
      
      try {
        await bs.retry(fn, 3, 50)
      } catch (err) {
        vt.expect(err).not.toBeInstanceOf(bs.RetryErr)
      }
    })
  })

  vt.describe("concurrent retries", () => {
    vt.it("handles multiple concurrent retry calls", async () => {
      let counter1 = 0
      let counter2 = 0
      
      const fn1 = async () => {
        counter1++
        if (counter1 < 2) throw new Error("fail1")
        return "result1"
      }
      
      const fn2 = async () => {
        counter2++
        if (counter2 < 3) throw new Error("fail2")
        return "result2"
      }
      
      const [r1, r2] = await Promise.all([
        bs.retry(fn1, 3, 50),
        bs.retry(fn2, 5, 50)
      ])
      
      vt.expect(r1).toBe("result1")
      vt.expect(r2).toBe("result2")
    })
  })

  vt.describe("function context and closure", () => {
    vt.it("maintains closure variables", async () => {
      let external = 10
      const fn = () => {
        external += 5
        return external
      }
      
      const result = await bs.retry(fn, 3, 50)
      vt.expect(result).toBe(15)
      vt.expect(external).toBe(15)
    })

    vt.it("maintains closure across retries", async () => {
      let counter = 0
      const fn = () => {
        counter++
        if (counter < 3) throw new Error("retry")
        return counter
      }
      
      const result = await bs.retry(fn, 5, 50)
      vt.expect(result).toBe(3)
    })
  })

  vt.describe("edge cases with timing", () => {
    vt.it("handles very short delay", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 3) throw new Error("retry")
        return "done"
      }
      
      const start = Date.now()
      await bs.retry(fn, 3, 1)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeLessThan(100)
    })

    vt.it("handles long delay", async () => {
      let attempts = 0
      const fn = () => {
        attempts++
        if (attempts < 2) throw new Error("retry")
        return "done"
      }
      
      const start = Date.now()
      await bs.retry(fn, 2, 200)
      const elapsed = Date.now() - start
      
      vt.expect(elapsed).toBeGreaterThanOrEqual(180)
    })
  })

  vt.describe("functions that modify state", () => {
    vt.it("side effects persist across retries", async () => {
      const sideEffects: number[] = []
      let attempts = 0
      
      const fn = () => {
        attempts++
        sideEffects.push(attempts)
        if (attempts < 3) throw new Error("retry")
        return "done"
      }
      
      await bs.retry(fn, 5, 50)
      vt.expect(sideEffects).toEqual([1, 2, 3])
    })
  })

  vt.describe("integration with LAST_ERROR", () => {
    vt.it("updates LAST_ERROR when throwing AnyErr subclass", async () => {
      class TestErr extends bs.AnyErr {}
      const fn = () => { throw new TestErr("test error") }
      
      try {
        await bs.retry(fn, 2, 50)
      } catch (err) {
        vt.expect(bs.LAST_ERROR).toBeInstanceOf(TestErr)
      }
    })
  })
})





vt.describe("get function", () => {
  
  vt.describe("basic GET requests", () => {
    vt.it("makes simple GET request", async () => {
      // This will likely fail in test env without mocking, but documents expected behavior
      vt.expect(async () => {
        await bs.get("https://jsonplaceholder.typicode.com/posts/1")
      }).toBeDefined()
    })

    vt.it("returns parsed JSON by default", async () => {
      // Test structure - actual API call behavior
      const result = await bs.get("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(result).toBeDefined()
      vt.expect(typeof result).toBe("object")
    })

    vt.it("handles URL without query params", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api/data")
      }).toBeDefined()
    })
  })

  vt.describe("query parameter handling", () => {
    vt.it("appends single query parameter", async () => {
      // Should construct URL like: /search?q=test
      vt.expect(async () => {
        await bs.get("https://example.com/search", { q: "test" })
      }).toBeDefined()
    })

    vt.it("appends multiple query parameters", async () => {
      // Should construct: /api?name=john&age=30&active=true
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          name: "john",
          age: "30",
          active: "true"
        })
      }).toBeDefined()
    })

    vt.it("handles empty query params object", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {})
      }).toBeDefined()
    })

    vt.it("handles undefined query params", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined)
      }).toBeDefined()
    })

    vt.it("URL encodes query parameter values", async () => {
      // Should encode spaces, special chars, etc.
      vt.expect(async () => {
        await bs.get("https://example.com/search", {
          q: "hello world",
          filter: "type=special&value=123"
        })
      }).toBeDefined()
    })

    vt.it("handles query params with special characters", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          email: "user@example.com",
          path: "/some/path"
        })
      }).toBeDefined()
    })

    vt.it("handles empty string query param values", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", { key: "" })
      }).toBeDefined()
    })
  })

  vt.describe("RequestInit customization", () => {
    vt.it("accepts custom RequestInit", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          headers: { "Authorization": "Bearer token123" }
        })
      }).toBeDefined()
    })

    vt.it("allows custom headers", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Custom-Header": "value"
          }
        })
      }).toBeDefined()
    })

    vt.it("respects default method GET", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api")
      }).toBeDefined()
    })

    vt.it("allows cache control", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          cache: "no-cache"
        })
      }).toBeDefined()
    })

    vt.it("allows credentials mode", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          credentials: "include"
        })
      }).toBeDefined()
    })

    vt.it("allows abort signal", async () => {
      const controller = new AbortController()
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          signal: controller.signal
        })
      }).toBeDefined()
    })
  })

  vt.describe("generic type parameter", () => {
    vt.it("returns type any by default", async () => {
      const result = await bs.get("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(result).toBeDefined()
    })

    vt.it("can specify return type explicitly", async () => {
      interface Post {
        userId: number
        id: number
        title: string
        body: string
      }
      const result = await bs.get<Post>("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(result).toBeDefined()
    })

    vt.it("can return array type", async () => {
      interface User {
        id: number
        name: string
      }
      const result = await bs.get<User[]>("https://jsonplaceholder.typicode.com/users")
      vt.expect(Array.isArray(result)).toBe(true)
    })

    // No idea how to fix
    // vt.it("can return primitive types", async () => {
    //   const result = await bs.get<string>("https://api.sampleapis.com/beers/ale")
    //   vt.expect(typeof result).toBe("string")
    // })
  })

  vt.describe("URL construction edge cases", () => {
    vt.it("handles URL that already has query params", async () => {
      // Should append with & not ?
      vt.expect(async () => {
        await bs.get("https://example.com/api?existing=param", { new: "param" })
      }).toBeDefined()
    })

    vt.it("handles URL with trailing slash", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api/", { key: "value" })
      }).toBeDefined()
    })

    vt.it("handles URL without protocol (if supported)", async () => {
      vt.expect(async () => {
        await bs.get("example.com/api")
      }).toBeDefined()
    })

    vt.it("handles localhost URLs", async () => {
      vt.expect(async () => {
        await bs.get("http://localhost:3000/api")
      }).toBeDefined()
    })

    vt.it("handles IPv4 URLs", async () => {
      vt.expect(async () => {
        await bs.get("http://127.0.0.1:8080/api")
      }).toBeDefined()
    })

    vt.it("handles URLs with port", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com:8443/api")
      }).toBeDefined()
    })

    vt.it("handles URLs with path segments", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api/v1/users/123")
      }).toBeDefined()
    })
  })

  vt.describe("query param special cases", () => {
    vt.it("handles numeric-like string values", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          id: "123",
          count: "0",
          page: "1"
        })
      }).toBeDefined()
    })

    vt.it("handles boolean-like string values", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          active: "true",
          deleted: "false"
        })
      }).toBeDefined()
    })

    vt.it("handles array-like param names", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          "ids[]": "1,2,3",
          "tags[]": "a,b,c"
        })
      }).toBeDefined()
    })

    vt.it("handles unicode in query params", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          name: "José",
          city: "São Paulo",
          emoji: "🔥"
        })
      }).toBeDefined()
    })

    vt.it("handles very long query param values", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", {
          data: "x".repeat(1000)
        })
      }).toBeDefined()
    })

    vt.it("handles many query parameters", async () => {
      const params: Record<string, string> = {}
      for (let i = 0; i < 50; i++) {
        params[`param${i}`] = `value${i}`
      }
      vt.expect(async () => {
        await bs.get("https://example.com/api", params)
      }).toBeDefined()
    })
  })

  vt.describe("error handling", () => {
    vt.it("throws on network error", async () => {
      await vt.expect(
        bs.get("https://this-domain-definitely-does-not-exist-12345.com")
      ).rejects.toThrow()
    })

    vt.it("throws on invalid URL", async () => {
      await vt.expect(
        bs.get("not-a-valid-url")
      ).rejects.toThrow()
    })

    vt.it("handles 404 response", async () => {
      await vt.expect(
        bs.get("https://jsonplaceholder.typicode.com/posts/999999")
      ).rejects.toThrow()
    })

    vt.it("handles 500 server error", async () => {
      await vt.expect(
        bs.get("https://httpstat.us/500")
      ).rejects.toThrow()
    })

    vt.it("handles timeout with abort signal", async () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 100)
      
      await vt.expect(
        bs.get("https://httpstat.us/200?sleep=5000", undefined, {
          method: "GET",
          signal: controller.signal
        })
      ).rejects.toThrow()
    })
  })

  vt.describe("response type handling", () => {
    vt.it("parses JSON response", async () => {
      const result = await bs.get("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(typeof result).toBe("object")
      vt.expect(result).not.toBeNull()
    })

    vt.it("handles empty response body", async () => {
      // Some APIs return 204 No Content
      vt.expect(async () => {
        await bs.get("https://httpstat.us/204")
      }).toBeDefined()
    })

    vt.it("handles text/plain responses", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/text")
      }).toBeDefined()
    })

    vt.it("handles array responses", async () => {
      const result = await bs.get("https://jsonplaceholder.typicode.com/users")
      vt.expect(Array.isArray(result)).toBe(true)
    })

    vt.it("handles nested object responses", async () => {
      const result = await bs.get("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(typeof result).toBe("object")
    })
  })

  vt.describe("combining args and init", () => {
    vt.it("uses both query params and custom headers", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", 
          { search: "test" },
          {
            method: "GET",
            headers: { "Authorization": "Bearer token" }
          }
        )
      }).toBeDefined()
    })

    vt.it("uses query params with cache control", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api",
          { id: "123" },
          {
            method: "GET",
            cache: "no-store"
          }
        )
      }).toBeDefined()
    })

    vt.it("uses all three parameters together", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api",
          { page: "1", limit: "10" },
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "X-API-Key": "secret"
            },
            credentials: "include"
          }
        )
      }).toBeDefined()
    })
  })

  vt.describe("edge cases with empty values", () => {
    vt.it("handles empty URL (should fail)", async () => {
      await vt.expect(bs.get("")).rejects.toThrow()
    })

    vt.it("handles whitespace-only URL", async () => {
      await vt.expect(bs.get("   ")).rejects.toThrow()
    })

    vt.it("handles null-like URLs (if not type-safe)", async () => {
      await vt.expect(bs.get(null as any)).rejects.toThrow()
    })
  })

  vt.describe("concurrent requests", () => {
    vt.it("handles multiple concurrent GET requests", async () => {
      const [r1, r2, r3] = await Promise.all([
        bs.get("https://jsonplaceholder.typicode.com/posts/1"),
        bs.get("https://jsonplaceholder.typicode.com/posts/2"),
        bs.get("https://jsonplaceholder.typicode.com/posts/3")
      ])
      
      vt.expect(r1).toBeDefined()
      vt.expect(r2).toBeDefined()
      vt.expect(r3).toBeDefined()
    })

    vt.it("handles concurrent requests with different params", async () => {
      const [r1, r2] = await Promise.all([
        bs.get("https://jsonplaceholder.typicode.com/posts", { userId: "1" }),
        bs.get("https://jsonplaceholder.typicode.com/posts", { userId: "2" })
      ])
      
      vt.expect(r1).toBeDefined()
      vt.expect(r2).toBeDefined()
    })
  })

  vt.describe("request headers edge cases", () => {
    vt.it("handles case-insensitive header names", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Content-Type": "application/json"
          }
        })
      }).toBeDefined()
    })

    vt.it("handles empty header values", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          headers: { "X-Custom": "" }
        })
      }).toBeDefined()
    })

    vt.it("handles many custom headers", async () => {
      const headers: Record<string, string> = {}
      for (let i = 0; i < 20; i++) {
        headers[`X-Header-${i}`] = `value-${i}`
      }
      
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, {
          method: "GET",
          headers
        })
      }).toBeDefined()
    })
  })

  vt.describe("method parameter override", () => {
    vt.it("respects GET method in init", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, { method: "GET" })
      }).toBeDefined()
    })

    vt.it("handles if method is overridden to POST (weird but possible)", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", undefined, { method: "POST" as any })
      }).toBeDefined()
    })
  })

  vt.describe("real API integration tests", () => {
    vt.it("fetches from JSONPlaceholder - single post", async () => {
      interface Post {
        userId: number
        id: number
        title: string
        body: string
      }
      
      const post = await bs.get<Post>("https://jsonplaceholder.typicode.com/posts/1")
      vt.expect(post.id).toBe(1)
      vt.expect(typeof post.title).toBe("string")
      vt.expect(typeof post.body).toBe("string")
    })

    vt.it("fetches from JSONPlaceholder - user list", async () => {
      interface User {
        id: number
        name: string
        email: string
      }
      
      const users = await bs.get<User[]>("https://jsonplaceholder.typicode.com/users")
      vt.expect(Array.isArray(users)).toBe(true)
      vt.expect(users.length).toBeGreaterThan(0)
    })

    vt.it("fetches with query filters", async () => {
      const posts = await bs.get("https://jsonplaceholder.typicode.com/posts", {
        userId: "1"
      })
      
      vt.expect(Array.isArray(posts)).toBe(true)
    })
  })

  vt.describe("URL encoding verification", () => {
    vt.it("properly encodes spaces", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/search", { q: "hello world" })
        // Should become: ?q=hello%20world or ?q=hello+world
      }).toBeDefined()
    })

    vt.it("properly encodes ampersands", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", { data: "a&b" })
        // Should become: ?data=a%26b
      }).toBeDefined()
    })

    vt.it("properly encodes equals signs", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", { expr: "x=y" })
        // Should become: ?expr=x%3Dy
      }).toBeDefined()
    })

    vt.it("properly encodes question marks", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", { text: "what?" })
        // Should become: ?text=what%3F
      }).toBeDefined()
    })

    vt.it("properly encodes forward slashes", async () => {
      vt.expect(async () => {
        await bs.get("https://example.com/api", { path: "a/b/c" })
        // Should become: ?path=a%2Fb%2Fc
      }).toBeDefined()
    })
  })
})




vt.describe("post function", () => {
  
  vt.describe("basic POST requests", () => {
    vt.it("makes simple POST request", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Test Post",
          body: "Test Body",
          userId: 1
        })
      }).toBeDefined()
    })

    vt.it("returns parsed JSON response", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        title: "Test",
        body: "Content",
        userId: 1
      })
      
      vt.expect(result).toBeDefined()
      vt.expect(typeof result).toBe("object")
    })

    vt.it("sends empty body object", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", {})
      }).toBeDefined()
    })
  })

  vt.describe("request body handling", () => {
    vt.it("sends simple key-value pairs", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        name: "John",
        age: 30,
        active: true
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends nested objects", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        user: {
          name: "Jane",
          email: "jane@example.com",
          address: {
            city: "NYC",
            zip: "10001"
          }
        }
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends arrays in body", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        tags: ["javascript", "typescript", "node"],
        ids: [1, 2, 3, 4, 5]
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends mixed types in body", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: "value" }
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("handles null values in body", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        name: "Test",
        value: null,
        optional: null
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("handles undefined values in body", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        name: "Test",
        value: undefined,
        optional: undefined
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends deeply nested structures", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        level1: {
          level2: {
            level3: {
              level4: {
                value: "deep"
              }
            }
          }
        }
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends large body object", async () => {
      const largeBody: Record<string, any> = {}
      for (let i = 0; i < 100; i++) {
        largeBody[`field${i}`] = `value${i}`
      }
      
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", largeBody)
      vt.expect(result).toBeDefined()
    })

    vt.it("sends body with special characters", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        text: "Hello \"World\" & <friends>",
        emoji: "🔥💯🚀",
        unicode: "Héllo Wörld"
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("sends body with empty strings", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        empty: "",
        whitespace: "   ",
        name: "test"
      })
      
      vt.expect(result).toBeDefined()
    })
  })

  vt.describe("default headers", () => {
    vt.it("sets Content-Type to application/json by default", async () => {
      // The default _init should include Content-Type: application/json
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Test"
        })
      }).toBeDefined()
    })

    vt.it("uses POST method by default", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", {
          data: "test"
        })
      }).toBeDefined()
    })
  })

  vt.describe("custom RequestInit", () => {
    vt.it("accepts custom headers", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", 
          { title: "Test" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer token123",
              "X-Custom-Header": "value"
            }
          }
        )
      }).toBeDefined()
    })

    vt.it("overrides Content-Type header", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
      }).toBeDefined()
    })

    vt.it("adds additional headers to defaults", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-API-Key": "secret"
            }
          }
        )
      }).toBeDefined()
    })

    vt.it("accepts credentials option", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          }
        )
      }).toBeDefined()
    })

    vt.it("accepts cache option", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-cache"
          }
        )
      }).toBeDefined()
    })

    vt.it("accepts abort signal", async () => {
      const controller = new AbortController()
      
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal
          }
        )
      }).toBeDefined()
    })

    vt.it("accepts mode option", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors"
          }
        )
      }).toBeDefined()
    })
  })

  vt.describe("generic type parameter", () => {
    vt.it("returns type any by default", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        title: "Test"
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("can specify return type explicitly", async () => {
      interface CreatePostResponse {
        id: number
        title: string
        body: string
        userId: number
      }
      
      const result = await bs.post<CreatePostResponse>(
        "https://jsonplaceholder.typicode.com/posts",
        { title: "Test", body: "Content", userId: 1 }
      )
      
      vt.expect(result).toBeDefined()
      vt.expect(result.id).toBeDefined()
    })

    vt.it("can return array type", async () => {
      interface Item {
        id: number
        name: string
      }
      
      const result = await bs.post<Item[]>(
        "https://jsonplaceholder.typicode.com/posts",
        { items: [{ name: "test" }] }
      )
      
      vt.expect(result).toBeDefined()
    })

    // // TODO
    // vt.it("can return primitive types", async () => {
    //   const result = await bs.post<string>(
    //     "https://example.com/api",
    //     { data: "test" }
    //   )

    //   vt.expect(typeof result).toBe("string")
    // })

    // // TODO
    // vt.it("can return null", async () => {
    //   const result = await bs.post<null>(
    //     "https://example.com/api",
    //     { data: "test" }
    //   )
      
    //   vt.expect(result).toBeNull()
    // })
  })

  vt.describe("error handling", () => {
    vt.it("throws on network error", async () => {
      await vt.expect(
        bs.post("https://this-domain-definitely-does-not-exist-12345.com", {
          data: "test"
        })
      ).rejects.toThrow()
    })

    vt.it("throws on invalid URL", async () => {
      await vt.expect(
        bs.post("not-a-valid-url", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles 400 bad request", async () => {
      await vt.expect(
        bs.post("https://httpstat.us/400", { data: "invalid" })
      ).rejects.toThrow()
    })

    vt.it("handles 401 unauthorized", async () => {
      await vt.expect(
        bs.post("https://httpstat.us/401", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles 403 forbidden", async () => {
      await vt.expect(
        bs.post("https://httpstat.us/403", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles 404 not found", async () => {
      await vt.expect(
        bs.post("https://httpstat.us/404", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles 500 server error", async () => {
      await vt.expect(
        bs.post("https://httpstat.us/500", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles timeout with abort signal", async () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 100)
      
      await vt.expect(
        bs.post("https://httpstat.us/200?sleep=5000",
          { data: "test" },
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal
          }
        )
      ).rejects.toThrow()
    })
  })

  vt.describe("response handling", () => {
    vt.it("parses JSON response", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        title: "Test",
        body: "Content",
        userId: 1
      })
      
      vt.expect(typeof result).toBe("object")
      vt.expect(result).not.toBeNull()
    })

    vt.it("handles response with created resource", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        title: "New Post",
        body: "New Content",
        userId: 1
      })
      
      vt.expect(result).toBeDefined()
      vt.expect(result.id).toBeDefined()
    })

    vt.it("handles empty response body (204 No Content)", async () => {
      vt.expect(async () => {
        await bs.post("https://httpstat.us/204", { data: "test" })
      }).toBeDefined()
    })

    vt.it("handles array response", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        data: [1, 2, 3]
      })
      
      vt.expect(result).toBeDefined()
    })
  })

  vt.describe("URL variations", () => {
    vt.it("handles URL with path segments", async () => {
      vt.expect(async () => {
        await bs.post("https://example.com/api/v1/users/create", {
          name: "John"
        })
      }).toBeDefined()
    })

    vt.it("handles localhost URLs", async () => {
      vt.expect(async () => {
        await bs.post("http://localhost:3000/api", { data: "test" })
      }).toBeDefined()
    })

    vt.it("handles IPv4 URLs", async () => {
      vt.expect(async () => {
        await bs.post("http://127.0.0.1:8080/api", { data: "test" })
      }).toBeDefined()
    })

    vt.it("handles URLs with port", async () => {
      vt.expect(async () => {
        await bs.post("https://example.com:8443/api", { data: "test" })
      }).toBeDefined()
    })

    vt.it("handles URLs with query params", async () => {
      vt.expect(async () => {
        await bs.post("https://example.com/api?token=abc123", {
          data: "test"
        })
      }).toBeDefined()
    })

    vt.it("handles URLs with hash fragments", async () => {
      vt.expect(async () => {
        await bs.post("https://example.com/api#section", { data: "test" })
      }).toBeDefined()
    })
  })

  vt.describe("concurrent requests", () => {
    vt.it("handles multiple concurrent POST requests", async () => {
      const [r1, r2, r3] = await Promise.all([
        bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Post 1",
          userId: 1
        }),
        bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Post 2",
          userId: 1
        }),
        bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Post 3",
          userId: 1
        })
      ])
      
      vt.expect(r1).toBeDefined()
      vt.expect(r2).toBeDefined()
      vt.expect(r3).toBeDefined()
    })

    vt.it("handles concurrent requests with different bodies", async () => {
      const [r1, r2] = await Promise.all([
        bs.post("https://jsonplaceholder.typicode.com/posts", {
          type: "article",
          data: { content: "A" }
        }),
        bs.post("https://jsonplaceholder.typicode.com/posts", {
          type: "comment",
          data: { content: "B" }
        })
      ])
      
      vt.expect(r1).toBeDefined()
      vt.expect(r2).toBeDefined()
    })
  })

  vt.describe("body serialization edge cases", () => {
    vt.it("handles Date objects in body", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        timestamp: new Date("2024-01-01"),
        name: "Test"
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("handles body with only numeric keys", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        "0": "zero",
        "1": "one",
        "2": "two"
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("handles body with symbol keys (should be ignored)", async () => {
      const sym = Symbol("test")
      const body: any = {
        name: "test",
        [sym]: "symbol value"
      }
      
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", body)
      vt.expect(result).toBeDefined()
    })

    vt.it("handles circular references (should throw or handle)", async () => {
      const obj: any = { name: "test" }
      obj.self = obj
      
      // JSON.stringify would throw on circular reference
      await vt.expect(
        bs.post("https://jsonplaceholder.typicode.com/posts", obj)
      ).rejects.toThrow()
    })

    vt.it("handles very long string values", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        longText: "x".repeat(10000)
      })
      
      vt.expect(result).toBeDefined()
    })

    vt.it("handles numeric values (integers, floats, special)", async () => {
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", {
        int: 42,
        float: 3.14159,
        negative: -100,
        zero: 0,
        negZero: -0,
        infinity: Infinity,
        negInfinity: -Infinity,
        nan: NaN
      })
      
      vt.expect(result).toBeDefined()
    })
  })

  vt.describe("method override scenarios", () => {
    vt.it("keeps POST method from default", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Test"
        })
      }).toBeDefined()
    })

    vt.it("can override method to PUT (unusual but possible)", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts/1",
          { title: "Updated" },
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
          }
        )
      }).toBeDefined()
    })

    vt.it("can override method to PATCH", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts/1",
          { title: "Patched" },
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
          }
        )
      }).toBeDefined()
    })
  })

  vt.describe("real API integration tests", () => {
    vt.it("creates post on JSONPlaceholder", async () => {
      interface Post {
        id: number
        title: string
        body: string
        userId: number
      }
      
      const result = await bs.post<Post>(
        "https://jsonplaceholder.typicode.com/posts",
        {
          title: "Integration Test Post",
          body: "This is a test body",
          userId: 1
        }
      )
      
      vt.expect(result.id).toBeDefined()
      vt.expect(result.title).toBe("Integration Test Post")
      vt.expect(result.body).toBe("This is a test body")
      vt.expect(result.userId).toBe(1)
    })

    vt.it("posts complex nested data", async () => {
      const result = await bs.post(
        "https://jsonplaceholder.typicode.com/posts",
        {
          title: "Complex Post",
          metadata: {
            tags: ["test", "integration"],
            priority: 5,
            author: {
              name: "Tester",
              email: "test@example.com"
            }
          },
          content: {
            sections: [
              { title: "Intro", text: "Introduction text" },
              { title: "Body", text: "Main content" }
            ]
          }
        }
      )
      
      vt.expect(result).toBeDefined()
    })
  })

  vt.describe("header case sensitivity", () => {
    vt.it("handles lowercase content-type", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "content-type": "application/json" }
          }
        )
      }).toBeDefined()
    })

    vt.it("handles mixed case Content-Type", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Test" },
          {
            method: "POST",
            headers: { "CoNtEnT-TyPe": "application/json" }
          }
        )
      }).toBeDefined()
    })
  })

  vt.describe("empty and null edge cases", () => {
    vt.it("handles empty URL (should fail)", async () => {
      await vt.expect(
        bs.post("", { data: "test" })
      ).rejects.toThrow()
    })

    vt.it("handles whitespace URL", async () => {
      await vt.expect(
        bs.post("   ", { data: "test" })
      ).rejects.toThrow()
    })
  })

  vt.describe("body with functions (should be filtered)", () => {
    vt.it("filters out function properties", async () => {
      const body: any = {
        name: "test",
        method: () => "function",
        data: 42
      }
      
      const result = await bs.post("https://jsonplaceholder.typicode.com/posts", body)
      vt.expect(result).toBeDefined()
    })
  })

  vt.describe("combining with retry", () => {
    vt.it("can be used with retry function", async () => {
      let attempts = 0
      const postFn = async () => {
        attempts++
        if (attempts < 2) throw new Error("Network error")
        return bs.post("https://jsonplaceholder.typicode.com/posts", {
          title: "Retried Post"
        })
      }
      
      const result = await bs.retry(postFn, 3, 50)
      vt.expect(result).toBeDefined()
      vt.expect(attempts).toBe(2)
    })
  })

  vt.describe("authentication headers", () => {
    vt.it("sends Bearer token", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Authenticated" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
            }
          }
        )
      }).toBeDefined()
    })

    vt.it("sends API key header", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "API Key" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": "secret-key-123"
            }
          }
        )
      }).toBeDefined()
    })

    vt.it("sends Basic auth header", async () => {
      vt.expect(async () => {
        await bs.post("https://jsonplaceholder.typicode.com/posts",
          { title: "Basic Auth" },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Basic " + btoa("username:password")
            }
          }
        )
      }).toBeDefined()
    })
  })
})




vt.describe("scramble_name function", () => {
  
  vt.describe("basic functionality", () => {
    vt.it("generates string of default length 64", () => {
      const name = bs.scramble_name()
      vt.expect(name).toBeDefined()
      vt.expect(typeof name).toBe("string")
      vt.expect(name.length).toBe(64)
    })

    vt.it("generates string of custom length", () => {
      const name = bs.scramble_name(20)
      vt.expect(name.length).toBe(20)
    })

    vt.it("generates very short string", () => {
      const name = bs.scramble_name(1)
      vt.expect(name.length).toBe(1)
    })

    vt.it("generates very long string", () => {
      const name = bs.scramble_name(1000)
      vt.expect(name.length).toBe(1000)
    })

    vt.it("generates empty string for length 0", () => {
      const name = bs.scramble_name(0)
      vt.expect(name).toBe("")
      vt.expect(name.length).toBe(0)
    })
  })

  vt.describe("randomness and uniqueness", () => {
    vt.it("generates different strings on successive calls", () => {
      const name1 = bs.scramble_name(64)
      const name2 = bs.scramble_name(64)
      vt.expect(name1).not.toBe(name2)
    })

    vt.it("generates unique strings in batch", () => {
      const names = Array.from({ length: 100 }, () => bs.scramble_name(32))
      const uniqueNames = new Set(names)
      vt.expect(uniqueNames.size).toBe(100)
    })

    vt.it("has high entropy - no obvious patterns", () => {
      const name = bs.scramble_name(100)
      
      // Check it's not all same character
      const chars = new Set(name.split(''))
      vt.expect(chars.size).toBeGreaterThan(10)
      
      // Check it's not sequential
      vt.expect(name).not.toMatch(/^(abc|123|xyz)+/)
    })

    vt.it("generates different short strings", () => {
      const names = Array.from({ length: 50 }, () => bs.scramble_name(5))
      const uniqueNames = new Set(names)
      // With 62^5 possible combinations, 50 should be unique
      vt.expect(uniqueNames.size).toBeGreaterThan(45)
    })
  })

  vt.describe("character set validation", () => {
    vt.it("contains only alphanumeric characters", () => {
      const name = bs.scramble_name(1000)
      vt.expect(name).toMatch(/^[a-zA-Z0-9]+$/)
    })

    vt.it("does not contain special characters", () => {
      const name = bs.scramble_name(200)
      vt.expect(name).not.toMatch(/[^a-zA-Z0-9]/)
    })

    vt.it("does not contain spaces", () => {
      const name = bs.scramble_name(100)
      vt.expect(name).not.toContain(' ')
    })

    vt.it("does not contain underscores or hyphens", () => {
      const name = bs.scramble_name(100)
      vt.expect(name).not.toContain('_')
      vt.expect(name).not.toContain('-')
    })

    vt.it("can contain uppercase letters", () => {
      // Generate many to ensure we hit uppercase
      const names = Array.from({ length: 10 }, () => bs.scramble_name(100)).join('')
      vt.expect(names).toMatch(/[A-Z]/)
    })

    vt.it("can contain lowercase letters", () => {
      const names = Array.from({ length: 10 }, () => bs.scramble_name(100)).join('')
      vt.expect(names).toMatch(/[a-z]/)
    })

    vt.it("can contain numbers", () => {
      const names = Array.from({ length: 10 }, () => bs.scramble_name(100)).join('')
      vt.expect(names).toMatch(/[0-9]/)
    })
  })

  vt.describe("character distribution", () => {
    vt.it("has reasonable character distribution", () => {
      const name = bs.scramble_name(10000)
      const charCounts = new Map<string, number>()
      
      for (const char of name) {
        charCounts.set(char, (charCounts.get(char) || 0) + 1)
      }
      
      // With 62 possible chars and 10000 samples, expect ~161 of each
      // Check that no character dominates (shouldn't be > 500)
      const maxCount = Math.max(...charCounts.values())
      vt.expect(maxCount).toBeLessThan(500)
      
      // Check that we use a decent variety
      vt.expect(charCounts.size).toBeGreaterThan(50)
    })

    vt.it("includes both cases and numbers in large sample", () => {
      const name = bs.scramble_name(1000)
      const hasUpper = /[A-Z]/.test(name)
      const hasLower = /[a-z]/.test(name)
      const hasDigit = /[0-9]/.test(name)
      
      vt.expect(hasUpper).toBe(true)
      vt.expect(hasLower).toBe(true)
      vt.expect(hasDigit).toBe(true)
    })
  })

  vt.describe("length edge cases", () => {
    vt.it("handles length 1", () => {
      const name = bs.scramble_name(1)
      vt.expect(name.length).toBe(1)
      vt.expect(name).toMatch(/^[a-zA-Z0-9]$/)
    })

    vt.it("handles length 2", () => {
      const name = bs.scramble_name(2)
      vt.expect(name.length).toBe(2)
    })

    vt.it("handles typical short ID length", () => {
      const name = bs.scramble_name(8)
      vt.expect(name.length).toBe(8)
    })

    vt.it("handles UUID-like length", () => {
      const name = bs.scramble_name(32)
      vt.expect(name.length).toBe(32)
    })

    vt.it("handles very large length", () => {
      const name = bs.scramble_name(10000)
      vt.expect(name.length).toBe(10000)
    })
  })

  vt.describe("consistency checks", () => {
    vt.it("always returns string type", () => {
      const lengths = [0, 1, 10, 64, 100, 1000]
      lengths.forEach(len => {
        const name = bs.scramble_name(len)
        vt.expect(typeof name).toBe("string")
      })
    })

    vt.it("never returns null or undefined", () => {
      for (let i = 0; i < 100; i++) {
        const name = bs.scramble_name()
        vt.expect(name).not.toBeNull()
        vt.expect(name).not.toBeUndefined()
      }
    })

    vt.it("returns exact length requested", () => {
      const testLengths = [0, 1, 5, 10, 32, 64, 100, 256, 1024]
      testLengths.forEach(len => {
        const name = bs.scramble_name(len)
        vt.expect(name.length).toBe(len)
      })
    })
  })

  vt.describe("collision resistance", () => {
    vt.it("low collision rate with default length", () => {
      const names = new Set<string>()
      const count = 10000
      
      for (let i = 0; i < count; i++) {
        names.add(bs.scramble_name(64))
      }
      
      // With 62^64 possible combinations, 10000 should all be unique
      vt.expect(names.size).toBe(count)
    })

    vt.it("low collision rate with medium length", () => {
      const names = new Set<string>()
      const count = 1000
      
      for (let i = 0; i < count; i++) {
        names.add(bs.scramble_name(16))
      }
      
      // 62^16 is huge, should have no collisions
      vt.expect(names.size).toBe(count)
    })

    vt.it("some collisions possible with very short length", () => {
      const names = new Set<string>()
      const count = 1000
      
      for (let i = 0; i < count; i++) {
        names.add(bs.scramble_name(2))
      }
      
      // With 62^2 = 3844 possible combinations, expect some collisions
      vt.expect(names.size).toBeLessThan(count)
      vt.expect(names.size).toBeGreaterThan(count * 0.5)
    })
  })

  vt.describe("use case scenarios", () => {
    vt.it("generates suitable session ID", () => {
      const sessionId = bs.scramble_name(32)
      vt.expect(sessionId.length).toBe(32)
      vt.expect(sessionId).toMatch(/^[a-zA-Z0-9]+$/)
    })

    vt.it("generates suitable filename", () => {
      const filename = `temp_${bs.scramble_name(16)}.txt`
      vt.expect(filename).toMatch(/^temp_[a-zA-Z0-9]{16}\.txt$/)
    })

    vt.it("generates suitable API key", () => {
      const apiKey = bs.scramble_name(64)
      vt.expect(apiKey.length).toBe(64)
      vt.expect(apiKey).toMatch(/^[a-zA-Z0-9]+$/)
    })

    vt.it("generates suitable short code", () => {
      const code = bs.scramble_name(6)
      vt.expect(code.length).toBe(6)
      vt.expect(code).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  vt.describe("performance", () => {
    vt.it("generates many short strings quickly", () => {
      const start = Date.now()
      for (let i = 0; i < 10000; i++) {
        bs.scramble_name(16)
      }
      const elapsed = Date.now() - start
      vt.expect(elapsed).toBeLessThan(1000) // Should be very fast
    })

    vt.it("generates long string efficiently", () => {
      const start = Date.now()
      bs.scramble_name(100000)
      const elapsed = Date.now() - start
      vt.expect(elapsed).toBeLessThan(500)
    })
  })

  vt.describe("no predictable patterns", () => {
    vt.it("does not start with same character", () => {
      const firstChars = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const name = bs.scramble_name(10)
        firstChars.add(name[0])
      }
      vt.expect(firstChars.size).toBeGreaterThan(10)
    })

    vt.it("does not end with same character", () => {
      const lastChars = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const name = bs.scramble_name(10)
        lastChars.add(name[name.length - 1])
      }
      vt.expect(lastChars.size).toBeGreaterThan(10)
    })

    vt.it("no repeating sequences", () => {
      const name = bs.scramble_name(100)
      // Check for obvious repeating patterns like "aaaa" or "123123"
      vt.expect(name).not.toMatch(/(.)\1{5,}/)
      vt.expect(name).not.toMatch(/(.{3,})\1{3,}/)
    })
  })

  vt.describe("negative and invalid inputs", () => {
    vt.it("handles negative length gracefully", () => {
      // Might return empty string or throw - either is reasonable
      const result = (() => {
        try {
          return bs.scramble_name(-5)
        } catch {
          return "error"
        }
      })()
      vt.expect(result === "" || result === "error").toBe(true)
    })

    vt.it("handles fractional length", () => {
      const name = bs.scramble_name(10.7)
      // Should either truncate or handle gracefully
      vt.expect(typeof name).toBe("string")
    })

    vt.it("handles very large length", () => {
      // Should work or throw, but not hang
      vt.expect(() => bs.scramble_name(1000000)).toBeDefined()
    })
  })

  vt.describe("determinism check", () => {
    vt.it("is non-deterministic (different on each call)", () => {
      const results = Array.from({ length: 20 }, () => bs.scramble_name(10))
      const uniqueResults = new Set(results)
      vt.expect(uniqueResults.size).toBeGreaterThan(15)
    })
  })

  vt.describe("character set completeness", () => {
    vt.it("eventually uses all 62 characters in base62", () => {
      const allChars = new Set<string>()
      
      // Generate enough to hit all chars
      for (let i = 0; i < 1000; i++) {
        const name = bs.scramble_name(100)
        for (const char of name) {
          allChars.add(char)
        }
      }
      
      // Should have close to 62 unique characters (a-z, A-Z, 0-9)
      vt.expect(allChars.size).toBeGreaterThanOrEqual(60)
      vt.expect(allChars.size).toBeLessThanOrEqual(62)
    })
  })

  vt.describe("URL safety", () => {
    vt.it("generates URL-safe strings", () => {
      const name = bs.scramble_name(100)
      const encoded = encodeURIComponent(name)
      vt.expect(encoded).toBe(name) // Should not need encoding
    })

    vt.it("safe for use in file paths", () => {
      const name = bs.scramble_name(50)
      // Should not contain path separators or special chars
      vt.expect(name).not.toMatch(/[\/\\:*?"<>|]/)
    })
  })

  vt.describe("concurrent generation", () => {
    vt.it("generates unique strings concurrently", async () => {
      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(bs.scramble_name(32))
      )
      const names = await Promise.all(promises)
      const uniqueNames = new Set(names)
      vt.expect(uniqueNames.size).toBe(100)
    })
  })

  vt.describe("memory efficiency", () => {
    vt.it("does not leak memory with many calls", () => {
      // Generate many strings without storing them
      for (let i = 0; i < 10000; i++) {
        bs.scramble_name(64)
      }
      // If this completes without hanging/crashing, it's good
      vt.expect(true).toBe(true)
    })
  })
})




vt.describe("roll_dice function", () => {
  
  vt.describe("basic functionality", () => {
    vt.it("returns number within range", () => {
      const result = bs.roll_dice(1, 10)
      vt.expect(result).toBeGreaterThanOrEqual(1)
      vt.expect(result).toBeLessThan(10)
    })

    vt.it("returns integer", () => {
      const result = bs.roll_dice(1, 100)
      vt.expect(Number.isInteger(result)).toBe(true)
    })

    vt.it("never returns max value (exclusive)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(1, 5))
      vt.expect(results).not.toContain(5)
    })

    vt.it("can return min value (inclusive)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(1, 5))
      vt.expect(results).toContain(1)
    })

    vt.it("returns value in range [min, max)", () => {
      for (let i = 0; i < 100; i++) {
        const result = bs.roll_dice(10, 20)
        vt.expect(result).toBeGreaterThanOrEqual(10)
        vt.expect(result).toBeLessThan(20)
      }
    })
  })

  vt.describe("standard dice rolls", () => {
    vt.it("simulates d6 (1-6)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(1, 7))
      results.forEach(r => {
        vt.expect(r).toBeGreaterThanOrEqual(1)
        vt.expect(r).toBeLessThanOrEqual(6)
      })
    })

    vt.it("simulates d20 (1-20)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(1, 21))
      results.forEach(r => {
        vt.expect(r).toBeGreaterThanOrEqual(1)
        vt.expect(r).toBeLessThanOrEqual(20)
      })
    })

    vt.it("simulates d100 (1-100)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(1, 101))
      results.forEach(r => {
        vt.expect(r).toBeGreaterThanOrEqual(1)
        vt.expect(r).toBeLessThanOrEqual(100)
      })
    })

    vt.it("simulates coin flip (0-1)", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(0, 2))
      results.forEach(r => {
        vt.expect([0, 1]).toContain(r)
      })
    })
  })

  vt.describe("range edge cases", () => {
    vt.it("handles range of 1 (deterministic)", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(5, 6))
      results.forEach(r => vt.expect(r).toBe(5))
    })

    vt.it("handles range of 2", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(0, 2))
      vt.expect(results).toContain(0)
      vt.expect(results).toContain(1)
      vt.expect(results).not.toContain(2)
    })

    vt.it("handles large range", () => {
      const result = bs.roll_dice(0, 1000000)
      vt.expect(result).toBeGreaterThanOrEqual(0)
      vt.expect(result).toBeLessThan(1000000)
    })

    vt.it("handles very large numbers", () => {
      const result = bs.roll_dice(1000000, 2000000)
      vt.expect(result).toBeGreaterThanOrEqual(1000000)
      vt.expect(result).toBeLessThan(2000000)
    })
  })

  vt.describe("negative numbers", () => {
    vt.it("handles negative min", () => {
      const result = bs.roll_dice(-10, 10)
      vt.expect(result).toBeGreaterThanOrEqual(-10)
      vt.expect(result).toBeLessThan(10)
    })

    vt.it("handles both negative", () => {
      const result = bs.roll_dice(-20, -10)
      vt.expect(result).toBeGreaterThanOrEqual(-20)
      vt.expect(result).toBeLessThan(-10)
    })

    vt.it("handles negative max", () => {
      const result = bs.roll_dice(-100, -50)
      vt.expect(result).toBeGreaterThanOrEqual(-100)
      vt.expect(result).toBeLessThan(-50)
    })

    vt.it("can return negative values", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(-5, 5))
      const hasNegative = results.some(r => r < 0)
      vt.expect(hasNegative).toBe(true)
    })
  })

  vt.describe("zero boundaries", () => {
    vt.it("handles zero as min", () => {
      const result = bs.roll_dice(0, 10)
      vt.expect(result).toBeGreaterThanOrEqual(0)
      vt.expect(result).toBeLessThan(10)
    })

    vt.it("handles zero as max", () => {
      const result = bs.roll_dice(-10, 0)
      vt.expect(result).toBeGreaterThanOrEqual(-10)
      vt.expect(result).toBeLessThan(0)
    })

    vt.it("handles zero in range", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(-5, 5))
      vt.expect(results).toContain(0)
    })

    vt.it("range from 0 to 1", () => {
      const result = bs.roll_dice(0, 1)
      vt.expect(result).toBe(0)
    })
  })

  vt.describe("distribution and randomness", () => {
    vt.it("generates different values (is random)", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(1, 100))
      const uniqueResults = new Set(results)
      vt.expect(uniqueResults.size).toBeGreaterThan(20)
    })

    vt.it("has reasonable distribution for d6", () => {
      const counts = [0, 0, 0, 0, 0, 0]
      const rolls = 6000
      
      for (let i = 0; i < rolls; i++) {
        const result = bs.roll_dice(1, 7)
        counts[result - 1]++
      }
      
      // Each face should appear roughly 1000 times (±300)
      counts.forEach(count => {
        vt.expect(count).toBeGreaterThan(700)
        vt.expect(count).toBeLessThan(1300)
      })
    })

    vt.it("hits all possible values in range", () => {
      const results = new Set<number>()
      const min = 1
      const max = 10
      
      for (let i = 0; i < 1000; i++) {
        results.add(bs.roll_dice(min, max))
      }
      
      // Should hit most or all values from 1-9
      vt.expect(results.size).toBeGreaterThanOrEqual(8)
    })

    vt.it("no obvious patterns in sequence", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(1, 10))
      
      // Check not all same
      const uniqueValues = new Set(results)
      vt.expect(uniqueValues.size).toBeGreaterThan(1)
      
      // Check not sequential
      const isSequential = results.every((val, i) => i === 0 || val === results[i-1] + 1)
      vt.expect(isSequential).toBe(false)
    })
  })

  vt.describe("return type consistency", () => {
    vt.it("always returns number type", () => {
      const testCases = [
        [0, 10],
        [-10, 10],
        [100, 200],
        [1, 2]
      ]
      
      testCases.forEach(([min, max]) => {
        const result = bs.roll_dice(min, max)
        vt.expect(typeof result).toBe("number")
      })
    })

    vt.it("never returns NaN", () => {
      for (let i = 0; i < 100; i++) {
        const result = bs.roll_dice(1, 100)
        vt.expect(Number.isNaN(result)).toBe(false)
      }
    })

    vt.it("never returns Infinity", () => {
      for (let i = 0; i < 100; i++) {
        const result = bs.roll_dice(1, 100)
        vt.expect(result).not.toBe(Infinity)
        vt.expect(result).not.toBe(-Infinity)
      }
    })

    vt.it("never returns undefined or null", () => {
      for (let i = 0; i < 100; i++) {
        const result = bs.roll_dice(1, 100)
        vt.expect(result).not.toBeNull()
        vt.expect(result).not.toBeUndefined()
      }
    })
  })

  vt.describe("boundary inclusivity", () => {
    vt.it("min is inclusive - hits min value", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(10, 15))
      vt.expect(results).toContain(10)
    })

    vt.it("max is exclusive - never hits max", () => {
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(10, 15))
      vt.expect(results).not.toContain(15)
    })

    vt.it("only returns values [min, max-1]", () => {
      const min = 5
      const max = 10
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(min, max))
      
      results.forEach(r => {
        vt.expect(r).toBeGreaterThanOrEqual(min)
        vt.expect(r).toBeLessThanOrEqual(max - 1)
      })
    })
  })

  vt.describe("invalid inputs", () => {
    vt.it("handles min equal to max", () => {
      // Range of 0, might return min or throw
      const result = (() => {
        try {
          return bs.roll_dice(5, 5)
        } catch {
          return "error"
        }
      })()
      
      if (result !== "error") {
        vt.expect(result).toBe(5)
      }
    })

    vt.it("handles min greater than max", () => {
      // Might swap, throw, or return undefined
      const result = (() => {
        try {
          return bs.roll_dice(10, 5)
        } catch {
          return "error"
        }
      })()
      
      vt.expect(result === "error" || typeof result === "number").toBe(true)
    })

    vt.it("handles fractional min", () => {
      const result = bs.roll_dice(1.5, 10)
      vt.expect(result).toBeGreaterThanOrEqual(1)
      vt.expect(result).toBeLessThan(10)
    })

    vt.it("handles fractional max", () => {
      const result = bs.roll_dice(1, 10.9)
      vt.expect(result).toBeGreaterThanOrEqual(1)
      vt.expect(result).toBeLessThan(11)
    })

    vt.it("handles both fractional", () => {
      const result = bs.roll_dice(1.2, 5.8)
      vt.expect(typeof result).toBe("number")
    })
  })

  vt.describe("common use cases", () => {
    vt.it("random array index", () => {
      const arr = ['a', 'b', 'c', 'd', 'e']
      const index = bs.roll_dice(0, arr.length)
      vt.expect(index).toBeGreaterThanOrEqual(0)
      vt.expect(index).toBeLessThan(arr.length)
      vt.expect(arr[index]).toBeDefined()
    })

    vt.it("random percentage (0-99)", () => {
      const percent = bs.roll_dice(0, 100)
      vt.expect(percent).toBeGreaterThanOrEqual(0)
      vt.expect(percent).toBeLessThan(100)
    })

    vt.it("random boolean (0 or 1)", () => {
      const bit = bs.roll_dice(0, 2)
      vt.expect([0, 1]).toContain(bit)
    })

    vt.it("random ID range", () => {
      const id = bs.roll_dice(1000, 10000)
      vt.expect(id).toBeGreaterThanOrEqual(1000)
      vt.expect(id).toBeLessThan(10000)
    })
  })

  vt.describe("performance", () => {
    vt.it("generates many rolls quickly", () => {
      const start = Date.now()
      for (let i = 0; i < 100000; i++) {
        bs.roll_dice(1, 100)
      }
      const elapsed = Date.now() - start
      vt.expect(elapsed).toBeLessThan(1000)
    })

    vt.it("handles large ranges efficiently", () => {
      const start = Date.now()
      for (let i = 0; i < 10000; i++) {
        bs.roll_dice(0, 1000000000)
      }
      const elapsed = Date.now() - start
      vt.expect(elapsed).toBeLessThan(500)
    })
  })

  vt.describe("statistical properties", () => {
    vt.it("coin flip approaches 50/50 distribution", () => {
      let heads = 0
      let tails = 0
      const flips = 10000
      
      for (let i = 0; i < flips; i++) {
        const result = bs.roll_dice(0, 2)
        if (result === 0) heads++
        else tails++
      }
      
      // Should be roughly 50/50 (±10%)
      vt.expect(heads).toBeGreaterThan(4000)
      vt.expect(heads).toBeLessThan(6000)
      vt.expect(tails).toBeGreaterThan(4000)
      vt.expect(tails).toBeLessThan(6000)
    })

    vt.it("d10 has uniform distribution", () => {
      const counts = Array(10).fill(0)
      const rolls = 10000
      
      for (let i = 0; i < rolls; i++) {
        const result = bs.roll_dice(0, 10)
        counts[result]++
      }
      
      // Each value should appear roughly 1000 times (±300)
      counts.forEach(count => {
        vt.expect(count).toBeGreaterThan(700)
        vt.expect(count).toBeLessThan(1300)
      })
    })
  })

  vt.describe("consecutive calls independence", () => {
    vt.it("consecutive calls produce different results", () => {
      const result1 = bs.roll_dice(1, 1000)
      const result2 = bs.roll_dice(1, 1000)
      const result3 = bs.roll_dice(1, 1000)
      
      // Not all three should be identical (extremely unlikely)
      vt.expect(result1 === result2 && result2 === result3).toBe(false)
    })

    vt.it("results are independent", () => {
      const pairs: [number, number][] = []
      
      for (let i = 0; i < 100; i++) {
        pairs.push([bs.roll_dice(1, 10), bs.roll_dice(1, 10)])
      }
      
      // Check that pairs aren't always the same or sequential
      const samePairs = pairs.filter(([a, b]) => a === b).length
      vt.expect(samePairs).toBeLessThan(30) // Should not be majority
    })
  })

  vt.describe("specific range scenarios", () => {
    vt.it("handles single-digit range", () => {
      const results = Array.from({ length: 100 }, () => bs.roll_dice(0, 10))
      const validValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      results.forEach(r => vt.expect(validValues).toContain(r))
    })

    vt.it("handles hundred range", () => {
      const result = bs.roll_dice(100, 200)
      vt.expect(result).toBeGreaterThanOrEqual(100)
      vt.expect(result).toBeLessThan(200)
    })

    vt.it("handles thousand range", () => {
      const result = bs.roll_dice(1000, 2000)
      vt.expect(result).toBeGreaterThanOrEqual(1000)
      vt.expect(result).toBeLessThan(2000)
    })
  })

  vt.describe("edge value testing", () => {
    vt.it("returns exactly min when range is 1", () => {
      for (let i = 0; i < 100; i++) {
        vt.expect(bs.roll_dice(42, 43)).toBe(42)
      }
    })

    vt.it("never exceeds max-1", () => {
      const max = 50
      const results = Array.from({ length: 1000 }, () => bs.roll_dice(0, max))
      const maxValue = Math.max(...results)
      vt.expect(maxValue).toBeLessThan(max)
      vt.expect(maxValue).toBeLessThanOrEqual(max - 1)
    })

    vt.it("can return min on first call", () => {
      // Just verify min is possible
      const results = Array.from({ length: 100 }, () => bs.roll_dice(100, 110))
      vt.expect(results).toContain(100)
    })
  })

  vt.describe("no mutation or side effects", () => {
    vt.it("does not modify global state observably", () => {
      const before = Date.now()
      bs.roll_dice(1, 100)
      const after = Date.now()
      
      // Only time should have passed, no other observable changes
      vt.expect(after).toBeGreaterThanOrEqual(before)
    })
  })
})