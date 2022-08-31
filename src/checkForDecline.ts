import type { CoverageDifference } from './compareCoverage';

export default function checkForDecline({
    coverageDifferences,
    margin = 0
}: {
    coverageDifferences: CoverageDifference[],
    margin?: number
}) {
    const total = coverageDifferences.find(({ name }) => name === 'total');

    if (!total) {
        // TODO: shouldn't be possible, but throw error
        return true;
    }

    if (
        total.branches < margin
        || total?.functions < margin
        || total?.lines < margin
        || total?.statements < margin
    ) {
        return true;
    }

    return false;
}
