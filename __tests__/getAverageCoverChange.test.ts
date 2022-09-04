import { readFile } from 'fs/promises';

import getAverageCoverageChange from '../src/getAverageCoverageChange';

import type { CoverageComparison } from '../src/compareCoverage';

const unchangedDiff = '__tests__/mocks/coverage-difference/unchanged.json';
const improveDiff = '__tests__/mocks/coverage-difference/improve.json';
const declineDiff = '__tests__/mocks/coverage-difference/decline.json';

describe('getAverageCoverageChange', () => {
    test('throws without total', async () => {
        const reportsDiffRaw = await readFile(unchangedDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        const [, ...metricsWithoutTotal] = reportsDiff.testMetrics;

        expect(() => {
            getAverageCoverageChange(metricsWithoutTotal);
        }).toThrow();
    });

    test('change in coverage average is 25', async () => {
        const reportsDiffRaw = await readFile(improveDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        expect(getAverageCoverageChange(reportsDiff.testMetrics)).toBe(25);
    });

    test('change in coverage average is -25', async () => {
        const reportsDiffRaw = await readFile(declineDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        expect(getAverageCoverageChange(reportsDiff.testMetrics)).toBe(-25);
    });
});
