import { add1000Separator, round } from '../ts/Util';

describe('Add 1,000 Separator', () => {
    // Initial
    test('Initial Arguments', () => {
        const res = add1000Separator()
        expect(res).toBe('0')
    })

    test('0', () => {
        const res = add1000Separator(0)
        expect(res).toBe('0')
    })

    test('123', () => {
        const res = add1000Separator(123)
        expect(res).toBe('123')
    })

    test('1234', () => {
        const res = add1000Separator(1234)
        expect(res).toBe('1,234')
    })

    test('123456', () => {
        const res = add1000Separator(123456)
        expect(res).toBe('123,456')
    })

    test('12345678', () => {
        const res = add1000Separator(12345678)
        expect(res).toBe('12,345,678')
    })

    test('1234567890', () => {
        const res = add1000Separator(1234567890)
        expect(res).toBe('1,234,567,890')
    })
})

describe('Round', () => {
    // Initial
    test('Initial Arguments', () => {
        const res = round()
        expect(res).toBeCloseTo(0)
    })

    // Round
    test('Round X.4', () => {
        const res = round(5.4)
        expect(res).toBeCloseTo(5)
    })

    test('Round X.5', () => {
        const res = round(4.5)
        expect(res).toBeCloseTo(5)
    })

    test('Round 1400', () => {
        const res = round(1400, 1000, 'round')
        expect(res).toBeCloseTo(1000)
    })

    test('Round 1500', () => {
        const res = round(1500, 1000, 'round')
        expect(res).toBeCloseTo(2000)
    })

    // Ceil
    test('Ceil X.4', () => {
        const res = round(5.4, 1, 'ceil')
        expect(res).toBeCloseTo(6)
    })

    test('Ceil X.5', () => {
        const res = round(4.5, 1, 'ceil')
        expect(res).toBeCloseTo(5)
    })

    test('Ceil 1400', () => {
        const res = round(1400, 1000, 'ceil')
        expect(res).toBeCloseTo(2000)
    })

    test('Ceil 1500', () => {
        const res = round(1500, 1000, 'ceil')
        expect(res).toBeCloseTo(2000)
    })

    // Floor
    test('Floor X.4', () => {
        const res = round(5.4, 1, 'floor')
        expect(res).toBeCloseTo(5)
    })

    test('Floor X.5', () => {
        const res = round(4.5, 1, 'floor')
        expect(res).toBeCloseTo(4)
    })

    test('Floor 1400', () => {
        const res = round(1400, 1000, 'floor')
        expect(res).toBeCloseTo(1000)
    })

    test('Floor 1500', () => {
        const res = round(1500, 1000, 'floor')
        expect(res).toBeCloseTo(1000)
    })

    // Round HD
    test('Round HD X.4', () => {
        const res = round(5.4, 1, 'roundhd')
        expect(res).toBeCloseTo(5)
    })

    test('Round HD X.5', () => {
        const res = round(4.5, 1, 'roundhd')
        expect(res).toBeCloseTo(4)
    })

    test('Round HD X.6', () => {
        const res = round(3.6, 1, 'roundhd')
        expect(res).toBeCloseTo(4)
    })

    test('Round HD 1400', () => {
        const res = round(1400, 1000, 'roundhd')
        expect(res).toBeCloseTo(1000)
    })

    test('Round HD 1500', () => {
        const res = round(1500, 1000, 'roundhd')
        expect(res).toBeCloseTo(1000)
    })

    test('Round HD 1500', () => {
        const res = round(1600, 1000, 'roundhd')
        expect(res).toBeCloseTo(2000)
    })

    // Minus Value
    test('Value = -345', () => {
        const res = round(-345, 10)
        expect(res).toBeCloseTo(-340)
    })

    // Minus Width
    test('Width = -10', () => {
        const res = round(123, -10)
        expect(res).toBeCloseTo(123)
    })

    // Wrong Type
    test('Wrong Type', () => {
        const res = round(15, 10, 'xyz')
        expect(res).toBeUndefined()
    })
})
