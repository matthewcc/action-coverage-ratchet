import { readFile } from 'fs/promises';

import compareCoverage from '../src/compareCoverage';

import type { CoverageReport } from '../src/jestCoverageReportTypes';

const lowCoverageMock = '__tests__/mocks/coverage-summary/low.json';
const mediumCoverageMock = '__tests__/mocks/coverage-summary/medium.json';
const highWithOneDeclineMock = '__tests__/mocks/coverage-summary/highWithOneDecline.json';

describe('compareCoverage', () => {
    test('comparison of total coverage change', async () => {
        const lowReportRaw = await readFile(lowCoverageMock);
        const mediumReportRaw = await readFile(mediumCoverageMock);
        const highWithOneDeclineReportRaw = await readFile(highWithOneDeclineMock);

        const lowReport = JSON.parse(lowReportRaw.toString()) as CoverageReport;
        const mediumReport = JSON.parse(mediumReportRaw.toString()) as CoverageReport;
        const highWithOneDeclineReport = JSON.parse(highWithOneDeclineReportRaw.toString()) as CoverageReport;

        const decline = compareCoverage({
            currentCoverageReport: mediumReport,
            incomingCoverageReport: lowReport
        });

        const improve = compareCoverage({
            currentCoverageReport: lowReport,
            incomingCoverageReport: mediumReport
        });

        const unchanged = compareCoverage({
            currentCoverageReport: mediumReport,
            incomingCoverageReport: mediumReport
        });

        const improvedOverallButOneDecline = compareCoverage({
            currentCoverageReport: mediumReport,
            incomingCoverageReport: highWithOneDeclineReport
        });

        const reportMissingTotal = JSON.parse(JSON.stringify(mediumReport)) as CoverageReport;

        delete reportMissingTotal.total;

        expect(decline.averageCoverageChange).toBeLessThan(0);
        expect(decline.coverageHasDeclined).toBe(true);

        expect(improve.averageCoverageChange).toBeGreaterThan(0);
        expect(improve.coverageHasDeclined).toBe(false);

        expect(unchanged.averageCoverageChange).toBe(0);
        expect(unchanged.coverageHasDeclined).toBe(false);

        //  one of the metrics has declined and should be considered a decline even if the overall coverage has improved
        expect(improvedOverallButOneDecline.averageCoverageChange).toBeGreaterThan(0);
        expect(improvedOverallButOneDecline.coverageHasDeclined).toBe(true);

        expect(() => {
            compareCoverage({
                currentCoverageReport: reportMissingTotal,
                incomingCoverageReport: mediumReport
            });
        }).toThrow();
    });
});
