import { readFile } from 'fs/promises';
import createComment from '../src/createComment';

import type { CoverageComparison } from '../src/compareCoverage';

const declineDiff = '__tests__/mocks/coverage-difference/decline.json';
const improveDiff = '__tests__/mocks/coverage-difference/improve.json';
const unchangedDiff = '__tests__/mocks/coverage-difference/unchanged.json';

describe('createComment', () => {
    test('Comment notes a decline in test coverage', async () => {
        const decliningReport = await readFile(declineDiff);
        const coverageComparison = JSON.parse(decliningReport.toString()) as CoverageComparison;

        const comment = createComment({
            coverageComparison,
            workingDirectory: 'test'
        });

        const commentDeclineNotesExceedLimit = createComment({
            coverageComparison,
            workingDirectory: 'test',
            commentSizeLimit: 100
        });

        const commentDeclineWithinMargin = createComment({
            coverageComparison: {
                ...coverageComparison,
                coverageHasDeclined: false
            },
            workingDirectory: 'test',
            margin: 26
        });

        expect(comment).toContain('Total coverage in at least one metric has declined');
        expect(commentDeclineWithinMargin).toContain('⚠️ Total coverage has decreased by an average of -25%');
        expect(commentDeclineNotesExceedLimit).toContain('⚠️ Coverage details are too large to display in this comment. ⚠️');
    });

    test('Comment notes an increase in test coverage', async () => {
        const improvingReport = await readFile(improveDiff);
        const coverageComparison = JSON.parse(improvingReport.toString()) as CoverageComparison;

        const comment = createComment({
            coverageComparison,
            workingDirectory: 'test'
        });

        expect(comment).toContain('Total coverage across metrics has gone up');
    });

    test('Comment notes unchanged coverage', async () => {
        const unchangedReport = await readFile(unchangedDiff);
        const coverageComparison = JSON.parse(unchangedReport.toString()) as CoverageComparison;

        const comment = createComment({
            coverageComparison,
            workingDirectory: 'test'
        });

        expect(comment).toContain('Total coverage across metrics are stable');
    });

    test('Comment has correct title', async () => {
        const unchangedReport = await readFile(unchangedDiff);
        const coverageComparison = JSON.parse(unchangedReport.toString()) as CoverageComparison;

        const commentNestedWorkingDirectory = createComment({
            coverageComparison,
            workingDirectory: 'monorepo-apps/my-monorepo-app'
        });

        const commentWithRootWorkingDirectory = createComment({
            coverageComparison,
            workingDirectory: '/'
        });

        expect(commentNestedWorkingDirectory).toContain('## Test Coverage Ratchet: monorepo-apps/my-monorepo-app');
        expect(commentWithRootWorkingDirectory).toContain('## Test Coverage Ratchet');
        expect(commentWithRootWorkingDirectory).not.toContain('## Test Coverage Ratchet:');
    });
});
