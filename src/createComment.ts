/* eslint-disable max-len */
import differenceInMetric from './differenceInMetric';

import type { MetricDiff, CoverageComparison, TestMetrics } from './compareCoverage';

const title = '## Test Coverage Ratchet';
const detailsSummary = 'Show additional coverage details';
const GITHUB_MESSAGE_SIZE_LIMIT = 65535;

const getTitle = (workingDirectory: string) => {
    if (['/', './'].includes(workingDirectory)) {
        return title;
    }

    return `${title}: ${workingDirectory}`;
};
export const getMetaComment = (workingDirectory: string) => (
    `<!-- jest coverage ratchet action for working directory: ${workingDirectory} -->`
);

const composeComment = (texts: string[]) => texts.join('\n\n');

export function createMarkdownSpoiler({ body, summary }: { body: string, summary: string }): string {
    if (body.length) {
        return `
        <details><summary>${summary}</summary>
        <br/>

        ${body}

        </details>
        `;
    }

    return '';
}

function createComparisonLine(metric: MetricDiff): string {
    if (metric.incoming > metric.current) {
        return ` ${metric.current} ⬆ ${metric.incoming}`;
    }

    if (metric.incoming < metric.current) {
        return ` ${metric.current} ⬇ ${metric.incoming}`;
    }

    return `${metric.current}`;
}

function createComparisons(testMetrics: TestMetrics[]) {
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
            const name = current.name.split('/').pop() as string;

            return [
                ...acc,
                `${name}:\n${metrics.join('\n')}`
            ];
        }

        return acc;
    }, []);

    return comparisons.join('\n\n');
}

export default function createComment({
    coverageComparison,
    workingDirectory,
    margin = 0,
    commentSizeLimit = GITHUB_MESSAGE_SIZE_LIMIT
}: {
    coverageComparison: CoverageComparison
    workingDirectory: string
    margin?: number
    commentSizeLimit?: number
}): string {
    let statusHeadline;

    const { averageCoverageChange, coverageHasDeclined, testMetrics } = coverageComparison;

    if (coverageHasDeclined) {
        statusHeadline = `**🛑 Total coverage in at least one metric has declined by more than the specified margin of ${margin}%. 🛑**`;
    }
    else if (averageCoverageChange > 0) {
        statusHeadline = `⭐️ Total coverage across metrics has gone up by an average of ${averageCoverageChange}%. ⭐️`;
    }
    else if (averageCoverageChange < 0) {
        statusHeadline = `⚠️ Total coverage has decreased by an average of ${averageCoverageChange}%, within the specified margin of ${margin}% ⚠️`;
    }
    else {
        statusHeadline = 'Total coverage across metrics are stable.';
    }

    const totalMetrics = testMetrics[0];
    const totalsSummary = [
        '#### Totals\n\n',
        `- statements: ${createComparisonLine(totalMetrics.statements)}`,
        `- branches: ${createComparisonLine(totalMetrics.branches)}`,
        `- functions: ${createComparisonLine(totalMetrics.functions)}`,
        `- lines: ${createComparisonLine(totalMetrics.lines)}`
    ].join('\n');

    const metaTag = getMetaComment(workingDirectory);
    const expandedReport = createComparisons(testMetrics);

    const aboveTheFold = composeComment([
        metaTag,
        getTitle(workingDirectory),
        statusHeadline,
        totalsSummary
    ]);

    const belowTheFold = createMarkdownSpoiler({
        summary: detailsSummary,
        body: expandedReport
    });

    if (aboveTheFold.length + belowTheFold.length > commentSizeLimit) {
        return composeComment([
            aboveTheFold,
            '⚠️ Coverage details are too large to display in this comment. ⚠️'
        ]);
    }

    return composeComment([
        aboveTheFold,
        belowTheFold
    ]);
}
