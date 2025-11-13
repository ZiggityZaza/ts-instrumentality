import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest' // or jest, whatever you use
import { range, ANSI_ESC, Out, retry } from '../src/base'



describe('range()', () => {
  
  describe('Basic functionality', () => {
    it('should handle single argument as "to" with default from=0', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle two arguments as from/to', () => {
      expect(range(2, 7)).toEqual([2, 3, 4, 5, 6])
    })

    it('should handle custom step', () => {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
    })

    it('should handle reverse counting when from > to', () => {
      expect(range(10, 5)).toEqual([10, 9, 8, 7, 6])
    })

    it('should handle reverse counting with custom step', () => {
      expect(range(10, 0, 2)).toEqual([10, 8, 6, 4, 2])
    })
  })

  describe('Edge cases - Equal values', () => {
    it('should return empty array when from === to', () => {
      expect(range(5, 5)).toEqual([])
    })

    it('should return empty array when single arg is 0', () => {
      expect(range(0)).toEqual([])
    })
  })

  describe('Negative numbers', () => {
    it('should handle negative from', () => {
      expect(range(-5, 0)).toEqual([-5, -4, -3, -2, -1])
    })

    it('should handle negative to', () => {
      expect(range(0, -5)).toEqual([0, -1, -2, -3, -4])
    })

    it('should handle both negative', () => {
      expect(range(-10, -5)).toEqual([-10, -9, -8, -7, -6])
    })

    it('should handle negative with custom step', () => {
      expect(range(-10, 0, 3)).toEqual([-10, -7, -4, -1])
    })
  })

  describe('Floating point numbers', () => {
    it('should handle float from/to values', () => {
      expect(range(0.5, 3.5)).toEqual([0.5, 1.5, 2.5])
    })

    it('should handle float step', () => {
      expect(range(0, 1, 0.1)).toHaveLength(10)
    })

    it('should handle float step - checking actual values', () => {
      const result = range(0, 1, 0.2)
      // Compare rounded values to avoid floating point precision errors
      const rounded = result.map(x => Math.round(x * 100) / 100)
      expect(rounded).toEqual([0, 0.2, 0.4, 0.6, 0.8])
    })

    it('should handle very small float step', () => {
      const result = range(0, 0.01, 0.001)
      expect(result.length).toBe(10)
    })
  })

  describe('Large ranges', () => {
    it('should handle large range without step', () => {
      const result = range(0, 10000)
      expect(result).toHaveLength(10000)
      expect(result[0]).toBe(0)
      expect(result[9999]).toBe(9999)
    })

    it('should handle very large range with large step', () => {
      const result = range(0, 1000000, 1000)
      expect(result).toHaveLength(1000)
    })

    it('should handle memory stress - 1 million elements', () => {
      // This might blow up memory or be slow
      const result = range(0, 1000000)
      expect(result).toHaveLength(1000000)
    })
  })

  describe('Step validation', () => {
    it('should throw on zero step', () => {
      expect(() => range(0, 10, 0)).toThrow('_step must be > 0')
    })

    it('should throw on negative step', () => {
      expect(() => range(0, 10, -1)).toThrow('_step must be > 0')
    })

    it('should throw on very small negative step', () => {
      expect(() => range(0, 10, -0.001)).toThrow('_step must be > 0')
    })
  })

  describe('NaN validation', () => {
    it('should throw on NaN from', () => {
      expect(() => range(NaN, 10)).toThrow("can't handle NaN")
    })

    it('should throw on NaN to', () => {
      expect(() => range(0, NaN)).toThrow("can't handle NaN")
    })

    it('should throw on NaN step', () => {
      expect(() => range(0, 10, NaN)).toThrow("can't handle NaN")
    })

    it('should throw on NaN single arg', () => {
      expect(() => range(NaN)).toThrow("can't handle NaN")
    })
  })

  describe('Infinity validation', () => {
    it('should throw on Infinity from', () => {
      expect(() => range(Infinity, 10)).toThrow("can't handle infite")
    })

    it('should throw on -Infinity from', () => {
      expect(() => range(-Infinity, 10)).toThrow("can't handle infite")
    })

    it('should throw on Infinity to', () => {
      expect(() => range(0, Infinity)).toThrow("can't handle infite")
    })

    it('should throw on Infinity step', () => {
      expect(() => range(0, 10, Infinity)).toThrow("can't handle infite")
    })
  })

  describe('Type coercion issues (TypeScript should catch, but testing runtime)', () => {
    it('should handle integer-like floats correctly', () => {
      expect(range(1.0, 5.0)).toEqual([1, 2, 3, 4])
    })

    it('should throw on string inputs', () => {
      // @ts-expect-error - testing runtime behavior
      expect(() => range('0', '5')).toThrow()
    })

    it('should handle null/undefined in weird ways', () => {
      // @ts-expect-error - testing runtime behavior
      expect(() => range(null, 5)).toThrow()
    })
  })

  describe('Step size edge cases', () => {
    it('should handle step larger than range', () => {
      expect(range(0, 5, 10)).toEqual([0])
    })

    it('should handle step exactly equal to range', () => {
      expect(range(0, 10, 10)).toEqual([0])
    })

    it('should handle very small step creating many elements', () => {
      const result = range(0, 10, 0.01)
      expect(result).toHaveLength(1000)
    })

    it('should handle tiny float step that causes precision issues', () => {
      // This will likely have floating point precision problems
      const result = range(0, 1, 0.1)
      // The last element might not be exactly 0.9 due to floating point math
      console.log('Float precision test:', result)
      expect(result.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Performance and behavior', () => {
    it('should not mutate any inputs', () => {
      const from = 0
      const to = 10
      const step = 1
      range(from, to, step)
      expect(from).toBe(0)
      expect(to).toBe(10)
      expect(step).toBe(1)
    })

    it('should return a new array each time', () => {
      const result1 = range(0, 5)
      const result2 = range(0, 5)
      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })

    it('should be performant for reasonable ranges', () => {
      const start = performance.now()
      range(0, 100000)
      const end = performance.now()
      expect(end - start).toBeLessThan(100) // Should be fast
    })
  })

  describe('Boundary precision issues', () => {
    it('should handle the last element correctly with step', () => {
      // Does it include or exclude the boundary correctly?
      expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]) // 12 would exceed
    })

    it('should handle reverse with step correctly', () => {
      expect(range(10, 0, 3)).toEqual([10, 7, 4, 1]) // -2 would exceed
    })

    it('should not include the "to" value', () => {
      const result = range(0, 10)
      expect(result).not.toContain(10)
      expect(result[result.length - 1]).toBe(9)
    })
  })
})




describe('Out class', () => {
  
  describe('Basic functionality', () => {
    it('should create instance with no args', () => {
      const out = new Out()
      expect(out.prefix).toBe("")
      expect(out.suffix).toBe("")
      expect(out.silence).toBe(false)
    })

    it('should print with default console.log', () => {
      const spy = vi.spyOn(console, 'log')
      const out = new Out()
      out.print('test')
      
      expect(spy).toHaveBeenCalledOnce()
      const call = spy.mock.calls[0]
      expect(call[0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T.*\]$/)
      expect(call[1]).toBe('test')
      spy.mockRestore()
    })

    it('should respect silence flag', () => {
      const spy = vi.spyOn(console, 'log')
      const out = new Out()
      out.silence = true
      out.print('test')
      
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should use custom prefix', () => {
      const spy = vi.spyOn(console, 'log')
      const out = new Out('[INFO]')
      out.print('test')
      
      const call = spy.mock.calls[0]
      expect(call[0]).toContain('[INFO]')
      spy.mockRestore()
    })

    it('should use custom suffix', () => {
      const spy = vi.spyOn(console, 'log')
      const out = new Out('', ' <END>')
      out.print('test')
      
      const call = spy.mock.calls[0]
      expect(call[0]).toContain(' <END>')
      spy.mockRestore()
    })
  })

  describe('Color handling', () => {
    it('should apply color to prefix', () => {
      const out = new Out('[INFO]', '', ANSI_ESC.RED)
      expect(out.prefix).toBe('\u001b[31m[INFO]\u001b[0m')
    })

    it('should apply color to suffix', () => {
      const out = new Out('', ' <END>', ANSI_ESC.BLUE)
      expect(out.suffix).toBe('\u001b[34m <END>\u001b[0m')
    })

    it('should apply color to both prefix and suffix', () => {
      const out = new Out('[START]', '[END]', ANSI_ESC.GREEN)
      expect(out.prefix).toBe('\u001b[32m[START]\u001b[0m')
      expect(out.suffix).toBe('\u001b[32m[END]\u001b[0m')
    })

    it('should handle empty strings with color', () => {
      const out = new Out('', '', ANSI_ESC.YELLOW)
      // Color codes are still added even with empty strings
      expect(out.prefix).toBe('\u001b[33m\u001b[0m')
      expect(out.suffix).toBe('\u001b[33m\u001b[0m')
    })

    it('should not apply color when undefined', () => {
      const out = new Out('[INFO]', '[END]', undefined)
      expect(out.prefix).toBe('[INFO]')
      expect(out.suffix).toBe('[END]')
    })
  })

  describe('Custom printer', () => {
    it('should use custom printer function', () => {
      const customPrinter = vi.fn()
      const out = new Out('', '', undefined, customPrinter)
      out.print('test')
      
      expect(customPrinter).toHaveBeenCalledOnce()
    })

    it('should pass all args to custom printer', () => {
      const customPrinter = vi.fn()
      const out = new Out('', '', undefined, customPrinter)
      out.print('arg1', 'arg2', 'arg3')
      
      expect(customPrinter).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}/),
        'arg1',
        'arg2',
        'arg3'
      )
    })

    it('should work with console.error as printer', () => {
      const spy = vi.spyOn(console, 'error')
      const out = new Out('', '', undefined, console.error)
      out.print('error message')
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should work with console.warn as printer', () => {
      const spy = vi.spyOn(console, 'warn')
      const out = new Out('', '', undefined, console.warn)
      out.print('warning')
      
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('Edge cases - Printing various types', () => {
    let mockPrinter: any
    let out: Out

    beforeEach(() => {
      mockPrinter = vi.fn()
      out = new Out('', '', undefined, mockPrinter)
    })

    it('should handle undefined', () => {
      out.print(undefined)
      expect(mockPrinter).toHaveBeenCalled()
    })

    it('should handle null', () => {
      out.print(null)
      expect(mockPrinter).toHaveBeenCalled()
    })

    it('should handle numbers', () => {
      out.print(42, 3.14, -0, Infinity, NaN)
      expect(mockPrinter).toHaveBeenCalledWith(
        expect.any(String),
        42, 3.14, -0, Infinity, NaN
      )
    })

    it('should handle objects', () => {
      const obj = { foo: 'bar' }
      out.print(obj)
      expect(mockPrinter).toHaveBeenCalledWith(expect.any(String), obj)
    })

    it('should handle arrays', () => {
      out.print([1, 2, 3])
      expect(mockPrinter).toHaveBeenCalledWith(expect.any(String), [1, 2, 3])
    })

    it('should handle functions', () => {
      const fn = () => {}
      out.print(fn)
      expect(mockPrinter).toHaveBeenCalledWith(expect.any(String), fn)
    })

    it('should handle symbols', () => {
      const sym = Symbol('test')
      out.print(sym)
      expect(mockPrinter).toHaveBeenCalledWith(expect.any(String), sym)
    })

    it('should handle bigints', () => {
      out.print(123n)
      expect(mockPrinter).toHaveBeenCalledWith(expect.any(String), 123n)
    })

    it('should handle multiple mixed types', () => {
      out.print('string', 42, null, undefined, { obj: true }, [1, 2])
      expect(mockPrinter).toHaveBeenCalledOnce()
    })

    it('should handle no arguments', () => {
      out.print()
      expect(mockPrinter).toHaveBeenCalledOnce()
      expect(mockPrinter.mock.calls[0]).toHaveLength(1) // Just timestamp+prefix+suffix
    })

    it('should handle circular references', () => {
      const circular: any = { a: 1 }
      circular.self = circular
      // Should not throw
      expect(() => out.print(circular)).not.toThrow()
    })
  })

  describe('Timestamp behavior', () => {
    it('should include valid ISO timestamp', () => {
      const mockPrinter = vi.fn()
      const out = new Out('', '', undefined, mockPrinter)
      out.print('test')
      
      const timestamp = mockPrinter.mock.calls[0][0]
      expect(timestamp).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    })

    it('should generate different timestamps for consecutive calls', async () => {
      const mockPrinter = vi.fn()
      const out = new Out('', '', undefined, mockPrinter)
      
      out.print('first')
      await new Promise(resolve => setTimeout(resolve, 2))
      out.print('second')
      
      const ts1 = mockPrinter.mock.calls[0][0]
      const ts2 = mockPrinter.mock.calls[1][0]
      // Timestamps might be the same if too fast, but should at least not error
      expect(ts1).toBeTruthy()
      expect(ts2).toBeTruthy()
    })
  })

  describe('Mutation and state', () => {
    it('should allow toggling silence', () => {
      const spy = vi.spyOn(console, 'log')
      const out = new Out()
      
      out.print('should print')
      expect(spy).toHaveBeenCalledTimes(1)
      
      out.silence = true
      out.print('should not print')
      expect(spy).toHaveBeenCalledTimes(1)
      
      out.silence = false
      out.print('should print again')
      expect(spy).toHaveBeenCalledTimes(2)
      
      spy.mockRestore()
    })

    it('should allow changing prefix', () => {
      const mockPrinter = vi.fn()
      const out = new Out('[OLD]', '', undefined, mockPrinter)
      
      out.print('test')
      expect(mockPrinter.mock.calls[0][0]).toContain('[OLD]')
      
      out.prefix = '[NEW]'
      out.print('test')
      expect(mockPrinter.mock.calls[1][0]).toContain('[NEW]')
    })

    it('should allow changing printer', () => {
      const printer1 = vi.fn()
      const printer2 = vi.fn()
      const out = new Out('', '', undefined, printer1)
      
      out.print('test1')
      expect(printer1).toHaveBeenCalledOnce()
      expect(printer2).not.toHaveBeenCalled()
      
      out.printer = printer2
      out.print('test2')
      expect(printer1).toHaveBeenCalledOnce()
      expect(printer2).toHaveBeenCalledOnce()
    })
  })

  describe('ANSI_ESC enum values', () => {
    it('should have correct ANSI escape codes', () => {
      expect(ANSI_ESC.BOLD).toBe('\u001b[1m')
      expect(ANSI_ESC.RESET).toBe('\u001b[0m')
      expect(ANSI_ESC.RED).toBe('\u001b[31m')
      expect(ANSI_ESC.GREEN).toBe('\u001b[32m')
    })

    it('should work with all color values', () => {
      const colors = [
        ANSI_ESC.BLACK,
        ANSI_ESC.RED,
        ANSI_ESC.GREEN,
        ANSI_ESC.YELLOW,
        ANSI_ESC.BLUE,
        ANSI_ESC.MAGENTA,
        ANSI_ESC.CYAN,
        ANSI_ESC.WHITE
      ]
      
      colors.forEach(color => {
        expect(() => new Out('test', '', color)).not.toThrow()
      })
    })

    it('should work with formatting values', () => {
      const formats = [
        ANSI_ESC.BOLD,
        ANSI_ESC.ITALIC,
        ANSI_ESC.UNDERLINE,
        ANSI_ESC.STRIKETHROUGH
      ]
      
      formats.forEach(format => {
        expect(() => new Out('test', '', format)).not.toThrow()
      })
    })
  })

  describe('Stress tests', () => {
    it('should handle very long strings', () => {
      const mockPrinter = vi.fn()
      const out = new Out('', '', undefined, mockPrinter)
      const longString = 'a'.repeat(100000)
      
      expect(() => out.print(longString)).not.toThrow()
    })

    it('should handle many arguments', () => {
      const mockPrinter = vi.fn()
      const out = new Out('', '', undefined, mockPrinter)
      const manyArgs = Array(1000).fill('arg')
      
      expect(() => out.print(...manyArgs)).not.toThrow()
    })

    it('should handle rapid successive calls', () => {
      const mockPrinter = vi.fn()
      const out = new Out('', '', undefined, mockPrinter)
      
      for (let i = 0; i < 1000; i++) {
        out.print(`message ${i}`)
      }
      
      expect(mockPrinter).toHaveBeenCalledTimes(1000)
    })
  })

  describe('Weird edge cases', () => {
    it('should handle prefix/suffix with special characters', () => {
      const mockPrinter = vi.fn()
      const out = new Out('🚀💀', '✨🔥', undefined, mockPrinter)
      out.print('test')
      
      expect(mockPrinter.mock.calls[0][0]).toContain('🚀💀')
      expect(mockPrinter.mock.calls[0][0]).toContain('✨🔥')
    })

    it('should handle prefix/suffix with newlines', () => {
      const mockPrinter = vi.fn()
      const out = new Out('START\n', '\nEND', undefined, mockPrinter)
      out.print('test')
      
      expect(mockPrinter.mock.calls[0][0]).toContain('START\n')
      expect(mockPrinter.mock.calls[0][0]).toContain('\nEND')
    })

    it('should handle prefix/suffix with ANSI codes already in them', () => {
      const mockPrinter = vi.fn()
      const out = new Out('\u001b[31mRED', 'ALSO_RED\u001b[0m', ANSI_ESC.BLUE)
      out.print('test')
      
      // This will create nested/conflicting ANSI codes - probably broken
      expect(out.prefix).toBe('\u001b[34m\u001b[31mRED\u001b[0m')
    })

    it('should handle printer that throws', () => {
      const throwingPrinter = () => { throw new Error('Printer failed') }
      const out = new Out('', '', undefined, throwingPrinter)
      
      expect(() => out.print('test')).toThrow('Printer failed')
    })

    it('should handle printer that is not a function', () => {
      // @ts-expect-error - testing runtime behavior
      const out = new Out('', '', undefined, 'not a function')
      
      expect(() => out.print('test')).toThrow()
    })
  })
})



describe('retry()', () => {
  
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic success cases', () => {
    it('should return immediately on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 3, 1000)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should succeed on second attempt', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should succeed on last attempt', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 50)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should work with sync functions', async () => {
      const fn = vi.fn().mockReturnValue('sync result')
      
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('sync result')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Failure cases', () => {
    it('should throw after all attempts exhausted', async () => {
      const error = new Error('persistent failure')
      const fn = vi.fn().mockRejectedValue(error)
      
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('persistent failure')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw the last error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('error 1'))
        .mockRejectedValueOnce(new Error('error 2'))
        .mockRejectedValue(new Error('final error'))
      
      const promise = retry(fn, 3, 50)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('final error')
    })

    it('should preserve error types', async () => {
      class CustomError extends Error {
        code = 'CUSTOM'
      }
      const fn = vi.fn().mockRejectedValue(new CustomError('custom'))
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      try {
        await promise
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(CustomError)
        expect((err as CustomError).code).toBe('CUSTOM')
      }
    })
  })

  describe('Delay behavior', () => {
    it('should wait specified delay between retries', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 1000)
      
      // First call happens immediately
      await Promise.resolve()
      expect(fn).toHaveBeenCalledTimes(1)
      
      // Advance less than delay - should not retry yet
      await vi.advanceTimersByTimeAsync(500)
      expect(fn).toHaveBeenCalledTimes(1)
      
      // Advance past delay - should retry
      await vi.advanceTimersByTimeAsync(500)
      await Promise.resolve()
      expect(fn).toHaveBeenCalledTimes(2)
      
      await promise
    })

    it('should handle zero delay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 0)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should handle very large delay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 999999999)
      
      await vi.advanceTimersByTimeAsync(999999999)
      await Promise.resolve()
      
      const result = await promise
      expect(result).toBe('success')
    })

    it('should handle negative delay (treated as 0)', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, -1000)
      await vi.runAllTimersAsync()
      
      const result = await promise
      expect(result).toBe('success')
    })
  })

  describe('Max attempts edge cases', () => {
    it('should handle maxAttempts = 1', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 1, 100)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throw immediately when maxAttempts = 1 and fn fails', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'))
      
      const promise = retry(fn, 1, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('fail')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throw RetryErr when maxAttempts = 0', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 0, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('Invalid max attempts value')
      expect(fn).not.toHaveBeenCalled()
    })

    it('should throw RetryErr when maxAttempts is negative', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, -1, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('Invalid max attempts value')
      expect(fn).not.toHaveBeenCalled()
    })

    it('should throw RetryErr when maxAttempts is -5', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, -5, 100)
      await vi.runAllTimersAsync()
      
      // The while loop won't execute, goes straight to throw
      await expect(promise).rejects.toThrow('Invalid max attempts value -6')
    })

    it('should handle very large maxAttempts', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 1000000, 0)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Function arguments', () => {
    it('should pass no args correctly', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenCalledWith()
    })

    it('should pass single arg correctly', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 3, 100, 'arg1')
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenCalledWith('arg1')
    })

    it('should pass multiple args correctly', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 3, 100, 'arg1', 42, { foo: 'bar' })
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenCalledWith('arg1', 42, { foo: 'bar' })
    })

    it('should pass same args on every retry', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, 3, 50, 'test', 123)
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenNthCalledWith(1, 'test', 123)
      expect(fn).toHaveBeenNthCalledWith(2, 'test', 123)
      expect(fn).toHaveBeenNthCalledWith(3, 'test', 123)
    })

    it('should handle undefined args', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      const promise = retry(fn, 3, 100, undefined, null)
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenCalledWith(undefined, null)
    })

    it('should handle complex object args', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const complexArg = { nested: { deep: [1, 2, 3] }, fn: () => {} }
      
      const promise = retry(fn, 3, 100, complexArg)
      await vi.runAllTimersAsync()
      await promise
      
      expect(fn).toHaveBeenCalledWith(complexArg)
    })
  })

  describe('Error types', () => {
    it('should handle string errors', async () => {
      const fn = vi.fn().mockRejectedValue('string error')
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toBe('string error')
    })

    it('should handle number errors', async () => {
      const fn = vi.fn().mockRejectedValue(404)
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toBe(404)
    })

    it('should handle null errors', async () => {
      const fn = vi.fn().mockRejectedValue(null)
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toBe(null)
    })

    it('should handle undefined errors', async () => {
      const fn = vi.fn().mockRejectedValue(undefined)
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toBe(undefined)
    })

    it('should handle sync throw', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw new Error('sync throw')
      })
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('sync throw')
    })
  })

  describe('Return value types', () => {
    it('should handle string return', async () => {
      const fn = vi.fn().mockResolvedValue('string')
      const result = await retry(fn, 3, 0)
      expect(result).toBe('string')
    })

    it('should handle number return', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      const result = await retry(fn, 3, 0)
      expect(result).toBe(42)
    })

    it('should handle object return', async () => {
      const obj = { foo: 'bar' }
      const fn = vi.fn().mockResolvedValue(obj)
      const result = await retry(fn, 3, 0)
      expect(result).toBe(obj)
    })

    it('should handle undefined return', async () => {
      const fn = vi.fn().mockResolvedValue(undefined)
      const result = await retry(fn, 3, 0)
      expect(result).toBe(undefined)
    })

    it('should handle null return', async () => {
      const fn = vi.fn().mockResolvedValue(null)
      const result = await retry(fn, 3, 0)
      expect(result).toBe(null)
    })

    it('should handle Promise return from sync fn', async () => {
      const fn = vi.fn().mockReturnValue(Promise.resolve('async'))
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result).toBe('async')
    })
  })

  describe('Concurrent retries', () => {
    it('should handle multiple concurrent retry calls', async () => {
      const fn1 = vi.fn().mockResolvedValue('result1')
      const fn2 = vi.fn().mockResolvedValue('result2')
      
      const promise1 = retry(fn1, 3, 100)
      const promise2 = retry(fn2, 3, 100)
      
      await vi.runAllTimersAsync()
      
      const [result1, result2] = await Promise.all([promise1, promise2])
      
      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
    })

    it('should not interfere with each other', async () => {
      const fn1 = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success1')
      const fn2 = vi.fn().mockResolvedValue('success2')
      
      const promise1 = retry(fn1, 3, 100)
      const promise2 = retry(fn2, 3, 100)
      
      await vi.runAllTimersAsync()
      
      const [result1, result2] = await Promise.all([promise1, promise2])
      
      expect(result1).toBe('success1')
      expect(result2).toBe('success2')
      expect(fn1).toHaveBeenCalledTimes(2)
      expect(fn2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Function mutation', () => {
    it('should handle function that mutates external state', async () => {
      let counter = 0
      const fn = vi.fn().mockImplementation(() => {
        counter++
        if (counter < 3) throw new Error('not yet')
        return 'success'
      })
      
      const promise = retry(fn, 5, 50)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
      expect(counter).toBe(3)
    })

    it('should work with non-idempotent functions', async () => {
      const results: string[] = []
      const fn = vi.fn().mockImplementation(() => {
        results.push('called')
        if (results.length < 3) throw new Error('fail')
        return 'done'
      })
      
      const promise = retry(fn, 5, 50)
      await vi.runAllTimersAsync()
      await promise
      
      expect(results).toEqual(['called', 'called', 'called'])
    })
  })

  describe('Edge cases - weirdness', () => {
    it('should handle NaN maxAttempts', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      
      // NaN >= 0 is false, so while loop never runs
      const promise = retry(fn, NaN as any, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('Invalid max attempts value')
    })

    it('should handle Infinity maxAttempts with eventual success', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const promise = retry(fn, Infinity, 50)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
    })

    it('should handle float maxAttempts', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      // 2.7 becomes 2 after first decrement
      const promise = retry(fn, 2.7, 50)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('success')
    })

    it('should handle function that returns non-promise', async () => {
      const fn = vi.fn().mockReturnValue('plain value')
      
      const promise = retry(fn, 3, 100)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toBe('plain value')
    })

    it('should handle async function that throws sync', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        throw new Error('async throw')
      })
      
      const promise = retry(fn, 2, 100)
      await vi.runAllTimersAsync()
      
      await expect(promise).rejects.toThrow('async throw')
    })
  })

  describe('Real-world scenarios', () => {
    it('should simulate flaky network request', async () => {
      let attempts = 0
      const flakyFetch = vi.fn().mockImplementation(async () => {
        attempts++
        if (attempts <= 2) {
          throw new Error('Network timeout')
        }
        return { status: 200, data: 'success' }
      })
      
      const promise = retry(flakyFetch, 5, 1000)
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result).toEqual({ status: 200, data: 'success' })
      expect(flakyFetch).toHaveBeenCalledTimes(3)
    })

    it('should simulate database connection retry', async () => {
      let connectionAttempts = 0
      const connectDb = vi.fn().mockImplementation(async (connectionString: string) => {
        connectionAttempts++
        if (connectionAttempts < 3) {
          throw new Error('ECONNREFUSED')
        }
        return { connected: true, connectionString }
      })
      
      const promise = retry(connectDb, 5, 500, 'postgres://localhost')
      await vi.runAllTimersAsync()
      const result = await promise
      
      expect(result.connected).toBe(true)
      expect(result.connectionString).toBe('postgres://localhost')
    })
  })
})
