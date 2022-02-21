import { sum } from '../ts/InsurancePremium';

describe('Sum of Insurance Premium', () => {

    test('Initial Arguments', () => {
        const res = sum()
        expect(res.you    ).toBeCloseTo(0)
        expect(res.company).toBeCloseTo(0)
        expect(res.total  ).toBeCloseTo(0)
    })

    test('3 Arguments', () => {
        const a = {
            you:     1,
            company: 2,
            total:   3,
        }
        const b = {
            you:     4,
            company: 5,
            total:   9,
        }
        const c = {
            you:     7,
            company: 8,
            total:   15,
        }
        const res = sum(a, b, c)
        expect(res.you    ).toBeCloseTo(12)
        expect(res.company).toBeCloseTo(15)
        expect(res.total  ).toBeCloseTo(27)
    })

    test('Ignore Total Amount', () => {
        const a = {
            you:     1,
            company: 2,
            total:   10,
        }
        const b = {
            you:     1,
            company: 2,
            total:   11,
        }
        const c = {
            you:     1,
            company: 2,
            total:   12,
        }
        const res = sum(a, b, c)
        expect(res.you    ).toBeCloseTo(3)
        expect(res.company).toBeCloseTo(6)
        expect(res.total  ).toBeCloseTo(9)
    })
})
