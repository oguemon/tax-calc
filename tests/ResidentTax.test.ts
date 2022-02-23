import { ResidentTax } from '../ts/ResidentTax';

describe('Resident Tax', () => {
    test('Initial Arguments', () => {
        const res = new ResidentTax()
        expect(res.taxable_standard_income).toBeCloseTo(0)
        expect(res.basic_deduction        ).toBeCloseTo(330000)
        expect(res.premium_deduction      ).toBeCloseTo(0)
        expect(res.total_deduction        ).toBeCloseTo(330000)
        expect(res.taxable_income         ).toBeCloseTo(0)
        expect(res.capitation.pref        ).toBeCloseTo(1500)
        expect(res.capitation.city        ).toBeCloseTo(3500)
        expect(res.capitation.total       ).toBeCloseTo(5000)
        expect(res.income_tax_rate.pref   ).toBeCloseTo(0)
        expect(res.income_tax_rate.city   ).toBeCloseTo(0)
        expect(res.income_tax_rate.total  ).toBeCloseTo(0)
        expect(res.diff_personal_deduction).toBeCloseTo(0)
        expect(res.income_tax.pref        ).toBeCloseTo(0)
        expect(res.income_tax.city        ).toBeCloseTo(0)
        expect(res.income_tax.total       ).toBeCloseTo(0)
        expect(res.tax.pref               ).toBeCloseTo(1500)
        expect(res.tax.city               ).toBeCloseTo(3500)
        expect(res.tax.total              ).toBeCloseTo(5000)
        expect(res.tax_monthly            ).toBeCloseTo(400)
        expect(res.tax_monthly_june       ).toBeCloseTo(600)
    })

    test('Taxable Income - Rank 1', () => {
        const res = new ResidentTax(650999)
        expect(res.taxable_standard_income).toBeCloseTo(0)
    })

    test('Taxable Income - Rank 2', () => {
        const res = new ResidentTax(651000)
        expect(res.taxable_standard_income).toBeCloseTo(1000)
    })

    test('Taxable Income - Rank 3', () => {
        const res = new ResidentTax(1619000)
        expect(res.taxable_standard_income).toBeCloseTo(969000)
    })

    test('Taxable Income - Rank 4', () => {
        const res = new ResidentTax(1620000)
        expect(res.taxable_standard_income).toBeCloseTo(970000)
    })

    test('Taxable Income - Rank 5', () => {
        const res = new ResidentTax(1622000)
        expect(res.taxable_standard_income).toBeCloseTo(972000)
    })

    test('Taxable Income - Rank 6', () => {
        const res = new ResidentTax(1624000)
        expect(res.taxable_standard_income).toBeCloseTo(974000)
    })

    test('Taxable Income - Rank 7', () => {
        const res = new ResidentTax(1628000)
        expect(res.taxable_standard_income).toBeCloseTo(976800)
    })

    test('Taxable Income - Rank 8', () => {
        const res = new ResidentTax(1800000)
        expect(res.taxable_standard_income).toBeCloseTo(1080000)
    })

    test('Taxable Income - Rank 9', () => {
        const res = new ResidentTax(3600000)
        expect(res.taxable_standard_income).toBeCloseTo(2340000)
    })

    test('Taxable Income - Rank 10', () => {
        const res = new ResidentTax(6600000)
        expect(res.taxable_standard_income).toBeCloseTo(4740000)
    })

    test('Taxable Income - Rank 11', () => {
        const res = new ResidentTax(10000000)
        expect(res.taxable_standard_income).toBeCloseTo(7800000)
    })

    test('Yokohama City', () => {
        const res = new ResidentTax(5000000, 0, 13, 1)
        expect(res.income_tax.pref ).toBeCloseTo(62800)
        expect(res.income_tax.city ).toBeCloseTo(248400)
        expect(res.income_tax.total).toBeCloseTo(311200)
    })

    test('Nagoya City', () => {
        const res = new ResidentTax(5000000, 0, 22, 1)
        expect(res.income_tax.pref ).toBeCloseTo(62000)
        expect(res.income_tax.city ).toBeCloseTo(239000)
        expect(res.income_tax.total).toBeCloseTo(301000)
    })

    test('Kobe City', () => {
        const res = new ResidentTax(5000000, 0, 27, 1)
        expect(res.income_tax.pref ).toBeCloseTo(62100)
        expect(res.income_tax.city ).toBeCloseTo(248400)
        expect(res.income_tax.total).toBeCloseTo(310500)
    })

    test('Toyooka City', () => {
        const res = new ResidentTax(5000000, 0, 27, 2)
        expect(res.income_tax.pref ).toBeCloseTo(124200)
        expect(res.income_tax.city ).toBeCloseTo(189400)
        expect(res.income_tax.total).toBeCloseTo(313600)
    })

    test('Seirei Sitei City', () => {
        const res = new ResidentTax(5000000, 0, 1)
        expect(res.income_tax.pref ).toBeCloseTo(124200)
        expect(res.income_tax.city ).toBeCloseTo(186300)
        expect(res.income_tax.total).toBeCloseTo(310500)
    })
})
