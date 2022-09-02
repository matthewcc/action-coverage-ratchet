import { readFile } from 'fs/promises';

import compareCoverage, { getAverageCoverageChange, hasCoverageDeclined } from '../src/compareCoverage';

import type { CoverageReport } from '../src/coverageTypes';
import type { TestMetrics } from '../src/compareCoverage';

const differencesWithDeclines = '__tests__/mocks/coverage-difference/decline.json';
const differencesWithImprovement = '__tests__/mocks/coverage-difference/improve.json';
const lowCoverageMock = '__tests__/mocks/coverage-summary/low.json';
const mediumCoverageMock = '__tests__/mocks/coverage-summary/medium.json';

describe('compareCoverage', () => {
    test('comparison of low report to medium report shows negative change in total', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const coverageComparison = compareCoverage({
            currentCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport,
            incomingCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport
        });

        expect(coverageComparison.averageCoverageChange).toBeLessThan(0);
    });

    test('comparison of medium report to low report shows positive change in total coverage', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const coverageComparison = compareCoverage({
            currentCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport,
            incomingCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport
        });

        expect(coverageComparison.averageCoverageChange).toBeGreaterThan(0);
    });
});

describe('hasCoverageDeclined', () => {
    test('decline is true if any numbers in the coverage "total" are negative', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const coverageComparison = compareCoverage({
            currentCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport,
            incomingCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport
        });

        expect(coverageComparison.coverageHasDeclined).toBe(true);
    });

    test('decline is false if all numbers in the coverage "total" are postive or zero', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const coverageComparison = compareCoverage({
            currentCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport,
            incomingCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport
        });

        expect(coverageComparison.coverageHasDeclined).toBe(false);
    });
});
