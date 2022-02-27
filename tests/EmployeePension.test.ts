import { EmployeePension } from '../ts/EmployeePension';

describe('Employee Pension', () => {
    test('Initial Arguments', () => {
        const res = new EmployeePension()
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('Under Insurance Min Income', () => {
        const res = new EmployeePension(87999, 0, 0)
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })

    test('Not Bonus', () => {
        const res = new EmployeePension(88000, 0, 0)
        expect(res.premium.you    ).toBeCloseTo(8052)
        expect(res.premium.company).toBeCloseTo(8052)
        expect(res.premium.total  ).toBeCloseTo(16104)
    })

    test('Is Bonus', () => {
        const res = new EmployeePension(88000, 0, 1)
        expect(res.premium.you    ).toBeCloseTo(0)
        expect(res.premium.company).toBeCloseTo(0)
        expect(res.premium.total  ).toBeCloseTo(0)
    })
})
