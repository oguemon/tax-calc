import { WithholdingSalary } from '../ts/WithholdingSalary';

describe('Withholding Salary', () => {
    test('Initial Arguments', () => {
        const res = new WithholdingSalary(0, false, 0)
        expect(res.deductions_pre_round ).toBeCloseTo(45834)
        expect(res.basic_deductions     ).toBeCloseTo(40000)
        expect(res.spouse_deductions    ).toBeCloseTo(0)
        expect(res.dependents_deductions).toBeCloseTo(0)
        expect(res.taxable_income       ).toBeCloseTo(0)
        expect(res.tax_value            ).toBeCloseTo(0)
    })

    test('Taxable Income Deductions - Rank 1', () => {
        const res = new WithholdingSalary(135416, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(45834)
    })

    test('Taxable Income Deductions - Rank 2', () => {
        const res = new WithholdingSalary(149999, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(51667)
    })

    test('Taxable Income Deductions - Rank 3', () => {
        const res = new WithholdingSalary(299999, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(96667)
    })

    test('Taxable Income Deductions - Rank 4', () => {
        const res = new WithholdingSalary(549999, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(146667)
    })

    test('Taxable Income Deductions - Rank 5', () => {
        const res = new WithholdingSalary(708330, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(162500)
    })

    test('Taxable Income Deductions - Rank 6', () => {
        const res = new WithholdingSalary(708331, false, 0)
        expect(res.deductions_pre_round).toBeCloseTo(162500)
    })

    test('Basic Deductions - Rank 1', () => {
        const res = new WithholdingSalary(2162499, false, 0)
        expect(res.basic_deductions).toBeCloseTo(40000)
    })

    test('Basic Deductions - Rank 2', () => {
        const res = new WithholdingSalary(2204166, false, 0)
        expect(res.basic_deductions).toBeCloseTo(26667)
    })

    test('Basic Deductions - Rank 3', () => {
        const res = new WithholdingSalary(2245833, false, 0)
        expect(res.basic_deductions).toBeCloseTo(13334)
    })

    test('Basic Deductions - Rank 4', () => {
        const res = new WithholdingSalary(2245834, false, 0)
        expect(res.basic_deductions).toBeCloseTo(0)
    })

    test('Exist Partner', () => {
        const res = new WithholdingSalary(0, true, 0)
        expect(res.spouse_deductions).toBeCloseTo(31667)
    })

    test('5 Dependents', () => {
        const res = new WithholdingSalary(0, false, 5)
        expect(res.dependents_deductions).toBeCloseTo(158335)
    })

    test('Tax Value - Rank 1', () => {
        const res = new WithholdingSalary(100000, false, 0)
        expect(res.tax_value).toBeCloseTo(720)
    })

    test('Tax Value - Rank 2', () => {
        const res = new WithholdingSalary(300000, false, 0)
        expect(res.tax_value).toBeCloseTo(8380)
    })

    test('Tax Value - Rank 3', () => {
        const res = new WithholdingSalary(600000, false, 0)
        expect(res.tax_value).toBeCloseTo(47010)
    })

    test('Tax Value - Rank 4', () => {
        const res = new WithholdingSalary(800000, false, 0)
        expect(res.tax_value).toBeCloseTo(86200)
    })

    test('Tax Value - Rank 5', () => {
        const res = new WithholdingSalary(1500000, false, 0)
        expect(res.tax_value).toBeCloseTo(306480)
    })

    test('Tax Value - Rank 6', () => {
        const res = new WithholdingSalary(3200000, false, 0)
        expect(res.tax_value).toBeCloseTo(1002620)
    })

    test('Tax Value - Rank 7', () => {
        const res = new WithholdingSalary(5000000, false, 0)
        expect(res.tax_value).toBeCloseTo(1814530)
    })
})
