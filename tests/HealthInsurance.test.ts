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
        expect(res.premium.you    ).toBeCloseTo(3422)
        expect(res.premium.company).toBeCloseTo(4002)
        expect(res.premium.total  ).toBeCloseTo(7424)
    })
})

describe('Insurance Rank', () => {
    const premium_rate = {
        you:     5.00,
        company: 5.00,
        total:   10.0,
    }

    test('Rank 1', () => {
        const res = new HealthInsurance(premium_rate, 88000, 62999)
        expect(res.premium.total).toBeCloseTo(5800)
    })

    test('Rank 2', () => {
        const res = new HealthInsurance(premium_rate, 88000, 63000)
        expect(res.premium.total).toBeCloseTo(6800)
    })

    test('Rank 3', () => {
        const res = new HealthInsurance(premium_rate, 88000, 73000)
        expect(res.premium.total).toBeCloseTo(7800)
    })

    test('Rank 4', () => {
        const res = new HealthInsurance(premium_rate, 88000, 83000)
        expect(res.premium.total).toBeCloseTo(8800)
    })

    test('Rank 5', () => {
        const res = new HealthInsurance(premium_rate, 88000, 93000)
        expect(res.premium.total).toBeCloseTo(9800)
    })

    test('Rank 6', () => {
        const res = new HealthInsurance(premium_rate, 88000, 101000)
        expect(res.premium.total).toBeCloseTo(10400)
    })

    test('Rank 7', () => {
        const res = new HealthInsurance(premium_rate, 88000, 107000)
        expect(res.premium.total).toBeCloseTo(11000)
    })

    test('Rank 8', () => {
        const res = new HealthInsurance(premium_rate, 88000, 114000)
        expect(res.premium.total).toBeCloseTo(11800)
    })

    test('Rank 9', () => {
        const res = new HealthInsurance(premium_rate, 88000, 122000)
        expect(res.premium.total).toBeCloseTo(12600)
    })

    test('Rank 10', () => {
        const res = new HealthInsurance(premium_rate, 88000, 130000)
        expect(res.premium.total).toBeCloseTo(13400)
    })

    test('Rank 11', () => {
        const res = new HealthInsurance(premium_rate, 88000, 138000)
        expect(res.premium.total).toBeCloseTo(14200)
    })

    test('Rank 12', () => {
        const res = new HealthInsurance(premium_rate, 88000, 146000)
        expect(res.premium.total).toBeCloseTo(15000)
    })

    test('Rank 13', () => {
        const res = new HealthInsurance(premium_rate, 88000, 155000)
        expect(res.premium.total).toBeCloseTo(16000)
    })

    test('Rank 14', () => {
        const res = new HealthInsurance(premium_rate, 88000, 165000)
        expect(res.premium.total).toBeCloseTo(17000)
    })

    test('Rank 15', () => {
        const res = new HealthInsurance(premium_rate, 88000, 175000)
        expect(res.premium.total).toBeCloseTo(18000)
    })

    test('Rank 16', () => {
        const res = new HealthInsurance(premium_rate, 88000, 185000)
        expect(res.premium.total).toBeCloseTo(19000)
    })

    test('Rank 17', () => {
        const res = new HealthInsurance(premium_rate, 88000, 195000)
        expect(res.premium.total).toBeCloseTo(20000)
    })

    test('Rank 18', () => {
        const res = new HealthInsurance(premium_rate, 88000, 210000)
        expect(res.premium.total).toBeCloseTo(22000)
    })

    test('Rank 19', () => {
        const res = new HealthInsurance(premium_rate, 88000, 230000)
        expect(res.premium.total).toBeCloseTo(24000)
    })

    test('Rank 20', () => {
        const res = new HealthInsurance(premium_rate, 88000, 250000)
        expect(res.premium.total).toBeCloseTo(26000)
    })

    test('Rank 21', () => {
        const res = new HealthInsurance(premium_rate, 88000, 270000)
        expect(res.premium.total).toBeCloseTo(28000)
    })

    test('Rank 22', () => {
        const res = new HealthInsurance(premium_rate, 88000, 290000)
        expect(res.premium.total).toBeCloseTo(30000)
    })

    test('Rank 23', () => {
        const res = new HealthInsurance(premium_rate, 88000, 310000)
        expect(res.premium.total).toBeCloseTo(32000)
    })

    test('Rank 24', () => {
        const res = new HealthInsurance(premium_rate, 88000, 330000)
        expect(res.premium.total).toBeCloseTo(34000)
    })

    test('Rank 25', () => {
        const res = new HealthInsurance(premium_rate, 88000, 350000)
        expect(res.premium.total).toBeCloseTo(36000)
    })

    test('Rank 26', () => {
        const res = new HealthInsurance(premium_rate, 88000, 370000)
        expect(res.premium.total).toBeCloseTo(38000)
    })

    test('Rank 27', () => {
        const res = new HealthInsurance(premium_rate, 88000, 395000)
        expect(res.premium.total).toBeCloseTo(41000)
    })

    test('Rank 28', () => {
        const res = new HealthInsurance(premium_rate, 88000, 425000)
        expect(res.premium.total).toBeCloseTo(44000)
    })

    test('Rank 29', () => {
        const res = new HealthInsurance(premium_rate, 88000, 455000)
        expect(res.premium.total).toBeCloseTo(47000)
    })

    test('Rank 30', () => {
        const res = new HealthInsurance(premium_rate, 88000, 485000)
        expect(res.premium.total).toBeCloseTo(50000)
    })

    test('Rank 31', () => {
        const res = new HealthInsurance(premium_rate, 88000, 515000)
        expect(res.premium.total).toBeCloseTo(53000)
    })

    test('Rank 32', () => {
        const res = new HealthInsurance(premium_rate, 88000, 545000)
        expect(res.premium.total).toBeCloseTo(56000)
    })

    test('Rank 33', () => {
        const res = new HealthInsurance(premium_rate, 88000, 575000)
        expect(res.premium.total).toBeCloseTo(59000)
    })

    test('Rank 34', () => {
        const res = new HealthInsurance(premium_rate, 88000, 605000)
        expect(res.premium.total).toBeCloseTo(62000)
    })

    test('Rank 35', () => {
        const res = new HealthInsurance(premium_rate, 88000, 635000)
        expect(res.premium.total).toBeCloseTo(65000)
    })

    test('Rank 36', () => {
        const res = new HealthInsurance(premium_rate, 88000, 665000)
        expect(res.premium.total).toBeCloseTo(68000)
    })

    test('Rank 37', () => {
        const res = new HealthInsurance(premium_rate, 88000, 695000)
        expect(res.premium.total).toBeCloseTo(71000)
    })

    test('Rank 38', () => {
        const res = new HealthInsurance(premium_rate, 88000, 730000)
        expect(res.premium.total).toBeCloseTo(75000)
    })

    test('Rank 39', () => {
        const res = new HealthInsurance(premium_rate, 88000, 770000)
        expect(res.premium.total).toBeCloseTo(79000)
    })

    test('Rank 40', () => {
        const res = new HealthInsurance(premium_rate, 88000, 810000)
        expect(res.premium.total).toBeCloseTo(83000)
    })

    test('Rank 41', () => {
        const res = new HealthInsurance(premium_rate, 88000, 855000)
        expect(res.premium.total).toBeCloseTo(88000)
    })

    test('Rank 42', () => {
        const res = new HealthInsurance(premium_rate, 88000, 905000)
        expect(res.premium.total).toBeCloseTo(93000)
    })

    test('Rank 43', () => {
        const res = new HealthInsurance(premium_rate, 88000, 955000)
        expect(res.premium.total).toBeCloseTo(98000)
    })

    test('Rank 44', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1005000)
        expect(res.premium.total).toBeCloseTo(103000)
    })

    test('Rank 45', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1055000)
        expect(res.premium.total).toBeCloseTo(109000)
    })

    test('Rank 46', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1115000)
        expect(res.premium.total).toBeCloseTo(115000)
    })

    test('Rank 47', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1175000)
        expect(res.premium.total).toBeCloseTo(121000)
    })

    test('Rank 48', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1235000)
        expect(res.premium.total).toBeCloseTo(127000)
    })

    test('Rank 49', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1295000)
        expect(res.premium.total).toBeCloseTo(133000)
    })

    test('Rank 50', () => {
        const res = new HealthInsurance(premium_rate, 88000, 1355000)
        expect(res.premium.total).toBeCloseTo(139000)
    })

    test('Max Amount Income', () => {
        const res = new HealthInsurance(premium_rate, 88000, Number.MAX_SAFE_INTEGER)
        expect(res.premium.total).toBeCloseTo(139000)
    })
})
