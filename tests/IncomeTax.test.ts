import { IncomeTax } from '../ts/IncomeTax';

describe('Income Tax', () => {
    test('Initial Arguments', () => {
        const res = new IncomeTax()
        expect(res.taxable_standard_income).toBeCloseTo(0)
        expect(res.basic_deduction        ).toBeCloseTo(480000)
        expect(res.premium_deduction      ).toBeCloseTo(0)
        expect(res.total_deduction        ).toBeCloseTo(480000)
        expect(res.taxable_income         ).toBeCloseTo(0)
        expect(res.tax_rate               ).toBeCloseTo(0.05)
        expect(res.tax                    ).toBeCloseTo(0)
        expect(res.reconstruction_special ).toBeCloseTo(0)
    })

    test('Premium Arguments', () => {
        const res = new IncomeTax(0, 100000)
        expect(res.taxable_standard_income).toBeCloseTo(0)
        expect(res.basic_deduction        ).toBeCloseTo(480000)
        expect(res.premium_deduction      ).toBeCloseTo(100000)
        expect(res.total_deduction        ).toBeCloseTo(580000)
        expect(res.taxable_income         ).toBeCloseTo(0)
        expect(res.tax_rate               ).toBeCloseTo(0.05)
        expect(res.tax                    ).toBeCloseTo(0)
        expect(res.reconstruction_special ).toBeCloseTo(0)
    })

    test('Taxable Standard Income - Rank 1', () => {
        const res = new IncomeTax(550999)
        expect(res.taxable_standard_income).toBeCloseTo(0)
    })

    test('Taxable Standard Income - Rank 2', () => {
        const res = new IncomeTax(551000)
        expect(res.taxable_standard_income).toBeCloseTo(1000)
    })

    test('Taxable Standard Income - Rank 3', () => {
        const res = new IncomeTax(1619000)
        expect(res.taxable_standard_income).toBeCloseTo(1069000)
    })

    test('Taxable Standard Income - Rank 4', () => {
        const res = new IncomeTax(1620000)
        expect(res.taxable_standard_income).toBeCloseTo(1070000)
    })

    test('Taxable Standard Income - Rank 5', () => {
        const res = new IncomeTax(1622000)
        expect(res.taxable_standard_income).toBeCloseTo(1072000)
    })

    test('Taxable Standard Income - Rank 6', () => {
        const res = new IncomeTax(1624000)
        expect(res.taxable_standard_income).toBeCloseTo(1074000)
    })

    test('Taxable Standard Income - Rank 7', () => {
        const res = new IncomeTax(1628000)
        expect(res.taxable_standard_income).toBeCloseTo(1076800)
    })

    test('Taxable Standard Income - Rank 8', () => {
        const res = new IncomeTax(1800000)
        expect(res.taxable_standard_income).toBeCloseTo(1180000)
    })

    test('Taxable Standard Income - Rank 9', () => {
        const res = new IncomeTax(3600000)
        expect(res.taxable_standard_income).toBeCloseTo(2440000)
    })

    test('Taxable Standard Income - Rank 10', () => {
        const res = new IncomeTax(6600000)
        expect(res.taxable_standard_income).toBeCloseTo(4840000)
    })

    test('Taxable Standard Income - Rank 11', () => {
        const res = new IncomeTax(8500000)
        expect(res.taxable_standard_income).toBeCloseTo(6550000)
    })

    test('Basic Deduction - Rank 1', () => {
        const res = new IncomeTax(25950000)
        expect(res.basic_deduction).toBeCloseTo(480000)
    })

    test('Basic Deduction - Rank 2', () => {
        const res = new IncomeTax(26450000)
        expect(res.basic_deduction).toBeCloseTo(320000)
    })

    test('Basic Deduction - Rank 3', () => {
        const res = new IncomeTax(26950000)
        expect(res.basic_deduction).toBeCloseTo(160000)
    })

    test('Basic Deduction - Rank 4', () => {
        const res = new IncomeTax(26950001)
        expect(res.basic_deduction).toBeCloseTo(0)
    })
})
