import * as core from '@actions/core';

import { CoverageComparison } from './compareCoverage';

export const metaComment = (workingDirectory: string) => (
    `<!-- jest coverage ratchet action for working directory: ${workingDirectory} -->`
);

const createMsg = (texts: string[]) => texts.join('\n\n');

export const createMarkdownSpoiler = ({ body, summary }: { body: string, summary: string }): string => `
<details><summary>${summary}</summary>
<br/>

${body}

</details>
`;

export default function generateComment({
    coverageChange,
    workingDirectory,
    margin
}: {
    coverageChange: CoverageComparison
    workingDirectory: string
    margin: number
}): string {
    core.info('Creating comment');

    let headline;

    if (coverageChange.coverageHasDeclined) {
        // eslint-disable-next-line max-len
        headline = `**🛑 Total coverage in at least one metric has declined by more than the specified margin of ${margin}%. 🛑**`;
    }
    else if (coverageChange.averageCoverageChange > 0) {
        headline = `**⭐️ Total coverage across metrics have gone up by ${coverageChange.averageCoverageChange}%. ⭐️**`;
    }
    else {
        headline = '**Total coverage across metrics is stable.**';
    }

    return createMsg([
        metaComment(workingDirectory),
        '## Test Coverage Ratchet',
        headline,
        createMarkdownSpoiler({
            summary: 'Show additional coverage details',
            body: JSON.stringify(coverageChange.testMetrics, null, 2)
        })
    ]);
}
