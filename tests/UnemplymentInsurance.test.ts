import { UnemplymentInsurance } from '../ts/UnemplymentInsurance';

describe('Unemplyment Insurance', () => {

    test('Initial Arguments', () => {
        const res = new UnemplymentInsurance()
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('IndustryType = 一般の事業', () => {
        const res = new UnemplymentInsurance(0, 100000)
        expect(res.premium.you    ).toBeCloseTo(300)
        expect(res.premium.company).toBeCloseTo(650)
        expect(res.premium.total  ).toBeCloseTo(950)
    })

    test('IndustryType = 農林水産・清酒製造の事業', () => {
        const res = new UnemplymentInsurance(1, 100000)
        expect(res.premium.you    ).toBeCloseTo(400)
        expect(res.premium.company).toBeCloseTo(750)
        expect(res.premium.total  ).toBeCloseTo(1150)
    })

    test('IndustryType = 建設の事業', () => {
        const res = new UnemplymentInsurance(2, 100000)
        expect(res.premium.you    ).toBeCloseTo(400)
        expect(res.premium.company).toBeCloseTo(850)
        expect(res.premium.total  ).toBeCloseTo(1250)
    })
})
