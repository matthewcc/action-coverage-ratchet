import differenceInMetric from './differenceInMetric';

import type { TestMetrics } from './compareCoverage';

/**
 * @returns average change across all total metrics (statements, branches, functions, lines)
 */
export default function getAverageCoverageChange(testMetrics: TestMetrics[]): number {
    const total = testMetrics.find(({ name }) => name === 'total');

    if (!total) {
        throw new Error('Could not find "total" in coverage report');
    }

    const averageCoverageChange = (differenceInMetric(total.branches)
        + differenceInMetric(total.functions)
        + differenceInMetric(total.lines)
        + differenceInMetric(total.statements)) / 4;

    return averageCoverageChange;
}
