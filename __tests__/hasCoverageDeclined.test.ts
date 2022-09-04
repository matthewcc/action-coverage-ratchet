import { readFile } from 'fs/promises';

import hasCoverageDeclined from '../src/hasCoverageDeclined';

import type { CoverageComparison } from '../src/compareCoverage';

const unchangedDiff = '__tests__/mocks/coverage-difference/unchanged.json';
const declineDiff = '__tests__/mocks/coverage-difference/decline.json';

describe('hasCoverageDeclined', () => {
    test('has not declined', async () => {
        const reportsDiffRaw = await readFile(unchangedDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        const testMetrics = reportsDiff.testMetrics[0];

        expect(hasCoverageDeclined({
            testMetrics
        })).toBe(false);
    });

    test('has declined', async () => {
        const reportsDiffRaw = await readFile(declineDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        const testMetrics = reportsDiff.testMetrics[0];

        expect(hasCoverageDeclined({
            testMetrics
        })).toBe(true);
    });

    test('decline is within margin', async () => {
        const reportsDiffRaw = await readFile(declineDiff);
        const reportsDiff = JSON.parse(reportsDiffRaw.toString()) as CoverageComparison;

        const testMetrics = reportsDiff.testMetrics[0];

        expect(hasCoverageDeclined({
            testMetrics,
            margin: 26
        })).toBe(true);
    });
});
