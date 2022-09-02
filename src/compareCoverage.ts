import * as core from '@actions/core';

import type { CoverageReport } from './coverageTypes';

interface CurrentAndIncomimg {
    current: number
    incoming: number
}
export interface TestMetrics {
    name: string
    statements: CurrentAndIncomimg
    branches: CurrentAndIncomimg
    functions: CurrentAndIncomimg
    lines: CurrentAndIncomimg
}

export interface CoverageComparison {
    testMetrics: TestMetrics[]
    coverageHasDeclined: boolean
    averageCoverageChange: number
}

const differenceInMetric = (currentAndIncoming: CurrentAndIncomimg): number => (
    currentAndIncoming.incoming - currentAndIncoming.current
);

/**
 * @returns boolean on whether any total metrics (statements, branches, functions, lines) have declined
 */
export function hasCoverageDeclined({
    testMetrics,
    margin = 0
}: {
    testMetrics: TestMetrics,
    margin?: number
}): boolean {
    if (
        differenceInMetric(testMetrics.branches) < margin
        || differenceInMetric(testMetrics.functions) < margin
        || differenceInMetric(testMetrics.lines) < margin
        || differenceInMetric(testMetrics.statements) < margin
    ) {
        return true;
    }

    return false;
}

/**
 * @returns average change across all total metrics (statements, branches, functions, lines)
 */
export function getAverageCoverageChange(testMetrics: TestMetrics[]): number {
    const total = testMetrics.find(({ name }) => name === 'total');

    if (!total) {
        // TODO: show error
        return 0;
    }

    const averageCoverageChange = (differenceInMetric(total.branches)
        + differenceInMetric(total.functions)
        + differenceInMetric(total.lines)
        + differenceInMetric(total.statements)) / 4;

    return averageCoverageChange;
}

export default function compareCoverage({
    currentCoverageReport,
    incomingCoverageReport,
    margin
}: {
    currentCoverageReport: CoverageReport
    incomingCoverageReport: CoverageReport
    margin?: number
}): CoverageComparison {
    const testMetrics: TestMetrics[] = [];

    core.info('Generating coverage comparison');

    Object.entries(currentCoverageReport).forEach(([key, currentReport]) => {
        const incomingReport = incomingCoverageReport[key];
        if (incomingReport) {
            // this file is covered in both reports
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
        // TODO: Track removed tests? Track new tests?
    });

    const totalTestMetrics = testMetrics.find(({ name }) => name === 'total');

    if (!totalTestMetrics) {
        throw new Error('No total coverage found in current coverage report');
    }

    const coverageHasDeclined = hasCoverageDeclined({ testMetrics: totalTestMetrics, margin });

    return {
        testMetrics,
        coverageHasDeclined,
        averageCoverageChange: getAverageCoverageChange(testMetrics)
        // TODO: identify new and removed tests
    };
}
