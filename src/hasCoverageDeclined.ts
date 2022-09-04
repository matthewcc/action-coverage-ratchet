import differenceInMetric from './differenceInMetric';

import type { TestMetrics } from './compareCoverage';
/**
 * @returns boolean on whether any total metrics (statements, branches, functions, lines) have declined
 */
export default function hasCoverageDeclined({
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
