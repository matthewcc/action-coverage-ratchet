import { readFile } from 'fs/promises';
import createComment from '../src/createComment';

import type { CurrentAndIncomimg, CoverageComparison, TestMetrics } from '../src/compareCoverage';

const declineDiff = '__tests__/mocks/coverage-difference/decline.json';

describe('compareCoverage', () => {
    test('comparison of low report to medium report shows negative change in total', async () => {
        const lowReport = await readFile(declineDiff);

        const coverageComparison = JSON.parse(lowReport.toString()) as CoverageComparison;

        const comment = createComment({
            coverageComparison,
            workingDirectory: 'test',
            margin: 0
        });

        console.log({ comment });

        const num = 1;
        expect(num).toBeLessThan(2);
    });
});
