import { readFile } from 'fs/promises';

import type { CoverageDifference } from '../src/compareCoverage';
import checkForDecline from '../src/checkForDecline';

const differencesWithDeclines = '__tests__/mocks/coverage-difference/decline.json';
const differencesWithImprovement = '__tests__/mocks/coverage-difference/improve.json';

describe('checkForDecline', () => {
    test('decline is true if any numbers in the coverage "total" are negative', async () => {
        const diff = await readFile(differencesWithDeclines);

        const declinesInTotalCoverage = checkForDecline({
            coverageDifferences: JSON.parse(diff.toString()) as CoverageDifference[]
        });

        expect(declinesInTotalCoverage).toBe(true);
    });

    test('decline is false if all numbers in the coverage "total" are postive or zero', async () => {
        const diff = await readFile(differencesWithImprovement);

        const declinesInTotalCoverage = checkForDecline({
            coverageDifferences: JSON.parse(diff.toString()) as CoverageDifference[]
        });

        expect(declinesInTotalCoverage).toBe(false);
    });
});
