import { HealthInsurance } from '../ts/HealthInsurance';

describe('Health Insurance', () => {
    const premium_rate = {
        you:      5.00,
        company:  6.00,
        total:   11.00,
    }

    test('Initial Arguments', () => {
        const res = new HealthInsurance(premium_rate)
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('Under Insurance Min Income', () => {
        const res = new HealthInsurance(premium_rate, 87999)
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('Not Bonus', () => {
        const res = new HealthInsurance(premium_rate, 88000, 0, 0)
        expect(res.premium.you    ).toBeCloseTo(2900)
        expect(res.premium.company).toBeCloseTo(3480)
        expect(res.premium.total  ).toBeCloseTo(6380)
    })

    test('Is Bonus', () => {
        const res = new HealthInsurance(premium_rate, 88000, 0, 1)
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('Over 40 Age', () => {
        const res = new HealthInsurance(premium_rate, 500000, 0, 0, true)
        expect(res.premium.you    ).toBeCloseTo(3419)
        expect(res.premium.company).toBeCloseTo(3999)
        expect(res.premium.total  ).toBeCloseTo(7418)
    })
})
