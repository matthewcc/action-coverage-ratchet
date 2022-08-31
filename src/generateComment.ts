import { CoverageDifference } from './compareCoverage';

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
interface GenerateCommentProps {
    coverageHasDeclined: boolean
    coverageDifferences: CoverageDifference[]
    verboseAnnotations: boolean
    workingDirectory: string
}

export default function generateComment({
    coverageHasDeclined,
    coverageDifferences,
    verboseAnnotations,
    workingDirectory
}: GenerateCommentProps): string {
    if (coverageHasDeclined) {
        return createMsg([
            metaComment(workingDirectory),
            'Total coverage in at least one metric has declined. Please review the changes and update the PR.',
            createMarkdownSpoiler({
                summary: 'Show additional coverage details',
                body: JSON.stringify(coverageDifferences, null, 2)
            })
        ]);
    }

    return createMsg([
        metaComment(workingDirectory),
        'No code coverage metrics have declined. Good job!',
        createMarkdownSpoiler({
            summary: 'Show additional coverage details',
            body: JSON.stringify(coverageDifferences, null, 2)
        })
    ]);
}
