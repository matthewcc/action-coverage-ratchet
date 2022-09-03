/* eslint-disable max-len */
import * as core from '@actions/core';

import { differenceInMetric } from './compareCoverage';

import type { CurrentAndIncomimg, CoverageComparison, TestMetrics } from './compareCoverage';

export const getMetaComment = (workingDirectory: string) => (
    `<!-- jest coverage ratchet action for working directory: ${workingDirectory} -->`
);

const composeComment = (texts: string[]) => texts.join('\n\n');

export const createMarkdownSpoiler = ({ body, summary }: { body: string, summary: string }): string => `
<details><summary>${summary}</summary>
<br/>

${body}

</details>
`;

const createComparisonLine = (metric: CurrentAndIncomimg): string => {
    if (metric.incoming > metric.current) {
        return ` ${metric.current} ⬆ ${metric.incoming}`;
    }

    if (metric.incoming < metric.current) {
        return ` ${metric.current} ⬇ ${metric.incoming}`;
    }

    return `${metric.current}`;
};

const createComparisons = (testMetrics: TestMetrics[]) => {
    const comparisons = testMetrics.reduce((acc: string[], current) => {
        if (current.name === 'total') {
            return acc;
        }

        const metrics = [];

        if (differenceInMetric(current.statements) < 0) {
            metrics.push(`- statements: ${createComparisonLine(current.statements)}`);
        }

        if (differenceInMetric(current.branches) < 0) {
            metrics.push(`- branches: ${createComparisonLine(current.branches)}`);
        }

        if (differenceInMetric(current.functions) < 0) {
            metrics.push(`- functions: ${createComparisonLine(current.functions)}`);
        }

        if (differenceInMetric(current.lines) < 0) {
            metrics.push(`- lines: ${createComparisonLine(current.lines)}`);
        }

        if (metrics.length > 0) {
            const name = current.name.split('/').pop() || '';

            return [
                ...acc,
                `${name}:\n${metrics.join('\n')}`
            ];
        }

        return acc;
    }, []);

    return comparisons.join('\n\n');
};

export default function createComment({
    coverageComparison,
    workingDirectory,
    margin
}: {
    coverageComparison: CoverageComparison
    workingDirectory: string
    margin: number
}): string {
    core.info('Creating comment');

    let headline;

    if (coverageComparison.coverageHasDeclined) {
        headline = `**🛑 Total coverage in at least one metric has declined by more than the specified margin of ${margin}%. 🛑**`;
    }
    else if (coverageComparison.averageCoverageChange > 0) {
        headline = `⭐️ Total coverage across metrics has gone up by an average of ${coverageComparison.averageCoverageChange}%. ⭐️`;
    }
    else if (coverageComparison.averageCoverageChange < 0) {
        headline = `⚠️ Total coverage has decreased by an average of ${coverageComparison.averageCoverageChange}%, within the specified margin of ${margin}% ⚠️`;
    }
    else {
        headline = 'Total coverage across metrics are stable.';
    }

    const totalMetrics = coverageComparison.testMetrics[0];
    const totalsSummary = [
        '#### Totals\n\n',
        `- statements: ${createComparisonLine(totalMetrics.statements)}`,
        `- branches: ${createComparisonLine(totalMetrics.branches)}`,
        `- functions: ${createComparisonLine(totalMetrics.functions)}`,
        `- lines: ${createComparisonLine(totalMetrics.lines)}`
    ].join('\n');

    const expandedReport = createComparisons(coverageComparison.testMetrics);

    return composeComment([
        getMetaComment(workingDirectory),
        '## Test Coverage Ratchet',
        headline,
        totalsSummary,
        expandedReport
            ? createMarkdownSpoiler({
                summary: 'Show additional coverage details',
                body: expandedReport
            })
            : ''
    ]);
}
