import { getIncomeTaxRate } from "../ts/Data";

describe('income tax rate', () => {
    test('Initial Arguments', () => {
        const res = getIncomeTaxRate()
        expect(res.rate).toBe(0.05)
        expect(res.deduction).toBe(0)
    })

    test('0 yen', () => {
        const res = getIncomeTaxRate(0)
        expect(res.rate).toBe(0.05)
        expect(res.deduction).toBe(0)
    })

    test('1,950,000 yen', () => {
        const res = getIncomeTaxRate(1950000)
        expect(res.rate).toBe(0.05)
        expect(res.deduction).toBe(0)
    })

    test('1,950,001 yen', () => {
        const res = getIncomeTaxRate(1950001)
        expect(res).toEqual({
            rate: 0.1,
            deduction: 97500,
        })
    })

    test('3,300,000 yen', () => {
        const res = getIncomeTaxRate(3300000)
        expect(res).toEqual({
            rate: 0.1,
            deduction: 97500,
        })
    })

    test('3,300,001 yen', () => {
        const res = getIncomeTaxRate(3300001)
        expect(res).toEqual({
            rate: 0.2,
            deduction: 427500,
        })
    })

    test('6,950,000 yen', () => {
        const res = getIncomeTaxRate(6950000)
        expect(res).toEqual({
            rate: 0.2,
            deduction: 427500,
        })
    })

    test('6,950,001 yen', () => {
        const res = getIncomeTaxRate(6950001)
        expect(res).toEqual({
            rate: 0.23,
            deduction: 636000,
        })
    })

    test('9,000,000 yen', () => {
        const res = getIncomeTaxRate(9000000)
        expect(res).toEqual({
            rate: 0.23,
            deduction: 636000,
        })
    })

    test('9,000,001 yen', () => {
        const res = getIncomeTaxRate(9000001)
        expect(res).toEqual({
            rate: 0.33,
            deduction: 1536000,
        })
    })

    test('18,000,000 yen', () => {
        const res = getIncomeTaxRate(18000000)
        expect(res).toEqual({
            rate: 0.33,
            deduction: 1536000,
        })
    })

    test('18,000,001 yen', () => {
        const res = getIncomeTaxRate(18000001)
        expect(res).toEqual({
            rate: 0.4,
            deduction: 2796000,
        })
    })

    test('40,000,000 yen', () => {
        const res = getIncomeTaxRate(40000000)
        expect(res).toEqual({
            rate: 0.4,
            deduction: 2796000,
        })
    })

    test('40,000,001 yen', () => {
        const res = getIncomeTaxRate(40000001)
        expect(res).toEqual({
            rate: 0.45,
            deduction: 4796000,
        })
    })
})
