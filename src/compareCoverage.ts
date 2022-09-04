import getAverageCoverageChange from './getAverageCoverageChange';
import hasCoverageDeclined from './hasCoverageDeclined';

import type { CoverageReport } from './jestCoverageReportTypes';

export interface MetricDiff {
    current: number
    incoming: number
}
export interface TestMetrics {
    name: string
    statements: MetricDiff
    branches: MetricDiff
    functions: MetricDiff
    lines: MetricDiff
}

export interface CoverageComparison {
    testMetrics: TestMetrics[]
    coverageHasDeclined: boolean
    averageCoverageChange: number
}

export default function compareCoverage({
    currentCoverageReport,
    incomingCoverageReport,
    margin = 0
}: {
    currentCoverageReport: CoverageReport
    incomingCoverageReport: CoverageReport
    margin?: number
}): CoverageComparison {
    const testMetrics: TestMetrics[] = [];

    Object.entries(currentCoverageReport).forEach(([key, currentReport]) => {
        const incomingReport = incomingCoverageReport[key];
        if (incomingReport) {
            const metrics: TestMetrics = {
                name: key,
                statements: {
                    current: currentReport.statements.pct,
                    incoming: incomingReport.statements.pct
                },
                branches: {
                    current: currentReport.branches.pct,
                    incoming: incomingReport.branches.pct
                },
                functions: {
                    current: currentReport.functions.pct,
                    incoming: incomingReport.functions.pct
                },
                lines: {
                    current: currentReport.lines.pct,
                    incoming: incomingReport.lines.pct
                }
            };

            testMetrics.push(metrics);
        }
    });

    const totalTestMetrics = testMetrics.find(({ name }) => name === 'total');

    if (!totalTestMetrics) {
        throw new Error('No "total" object found in coverage report');
    }

    const coverageHasDeclined = hasCoverageDeclined({ testMetrics: totalTestMetrics, margin });

    return {
        testMetrics,
        coverageHasDeclined,
        averageCoverageChange: getAverageCoverageChange(testMetrics)
        // TODO: identify new and removed tests ?
    };
}
