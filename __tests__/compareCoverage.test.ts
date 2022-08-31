import { readFile } from 'fs/promises';

import compareCoverage from '../src/compareCoverage';

import type { CoverageReport } from '../src/coverageTypes';

const lowCoverageMock = '__tests__/mocks/coverage-summary/low.json';
const mediumCoverageMock = '__tests__/mocks/coverage-summary/medium.json';

describe('compareCoverage', () => {
    test('comparison of low report to medium report shows negative coverage total', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const { coverageDifferences } = compareCoverage({
            baseCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport,
            newCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport
        });

        const totalCoverage = coverageDifferences.find(({ name }) => name === 'total');

        expect(totalCoverage?.lines).toBeLessThan(0);
    });

    test('comparison of medium report to low report shows positive coverage total', async () => {
        const lowReport = await readFile(lowCoverageMock);
        const mediumReport = await readFile(mediumCoverageMock);

        const { coverageDifferences } = compareCoverage({
            baseCoverageReport: JSON.parse(lowReport.toString()) as CoverageReport,
            newCoverageReport: JSON.parse(mediumReport.toString()) as CoverageReport
        });

        const totalCoverage = coverageDifferences.find(({ name }) => name === 'total');

        expect(totalCoverage?.lines).toBeGreaterThan(0);
    });
});
