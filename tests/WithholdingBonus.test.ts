import { WithholdingBonus } from '../ts/WithholdingBonus';

describe('Withholding Bonus', () => {
    test('Initial Arguments', () => {
        const res = new WithholdingBonus(0, 0)
        expect(res.tax_rate ).toBeCloseTo(0)
        expect(res.tax_value).toBeCloseTo(0)
    })

    test('Kou - Rank 10 No Dependents', () => {
        const res = new WithholdingBonus(1000000, 600999, true, 0)
        expect(res.tax_rate ).toBeCloseTo(18.378)
        expect(res.tax_value).toBeCloseTo(183780)
    })

    test('Kou - Rank 11 No Dependents', () => {
        const res = new WithholdingBonus(1000000, 601000, true, 0)
        expect(res.tax_rate ).toBeCloseTo(20.420)
        expect(res.tax_value).toBeCloseTo(204200)
    })

    test('Kou - Rank 10 8 Dependents', () => {
        const res = new WithholdingBonus(1000000, 707999, true, 8)
        expect(res.tax_rate ).toBeCloseTo(18.378)
        expect(res.tax_value).toBeCloseTo(183780)
    })

    test('Kou - Rank 11 8 Dependents', () => {
        const res = new WithholdingBonus(1000000, 708000, true, 8)
        expect(res.tax_rate ).toBeCloseTo(20.420)
        expect(res.tax_value).toBeCloseTo(204200)
    })

    test('Kou - Rank 21', () => {
        const res = new WithholdingBonus(1000000, 3590000, true, 3)
        expect(res.tax_rate ).toBeCloseTo(45.945)
        expect(res.tax_value).toBeCloseTo(459450)
    })

    test('Otsu - Rank 1', () => {
        const res = new WithholdingBonus(1000000, 221999, false, 0)
        expect(res.tax_rate ).toBeCloseTo(10.210)
        expect(res.tax_value).toBeCloseTo(102100)
    })

    test('Otsu - Rank 2', () => {
        const res = new WithholdingBonus(1000000, 222000, false, 0)
        expect(res.tax_rate ).toBeCloseTo(20.420)
        expect(res.tax_value).toBeCloseTo(204200)
    })

    test('Otsu - Rank 3', () => {
        const res = new WithholdingBonus(1000000, 293000, false, 0)
        expect(res.tax_rate ).toBeCloseTo(30.630)
        expect(res.tax_value).toBeCloseTo(306300)
    })

    test('Otsu - Rank 4', () => {
        const res = new WithholdingBonus(1000000, 524000, false, 0)
        expect(res.tax_rate ).toBeCloseTo(38.798)
        expect(res.tax_value).toBeCloseTo(387980)
    })

    test('Otsu - Rank 5', () => {
        const res = new WithholdingBonus(1000000, 1118000, false, 0)
        expect(res.tax_rate ).toBeCloseTo(45.945)
        expect(res.tax_value).toBeCloseTo(459450)
    })
})
