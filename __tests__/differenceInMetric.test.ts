import differenceInMetric from '../src/differenceInMetric';

describe('differenceInMetric', () => {
    test('returns the difference between the incoming and current metric', () => {
        expect(differenceInMetric({
            current: 10,
            incoming: 20
        })).toBe(10);

        expect(differenceInMetric({
            current: 94,
            incoming: 85
        })).toBe(-9);

        expect(differenceInMetric({
            current: 90,
            incoming: 90
        })).toBe(0);
    });
});
