import { Octokit } from '@octokit/rest';
import getPreviousComment from '../src/getPreviousComment';

const CONTEXT = {
    repo: 'testRepo',
    owner: 'testOwner'
};

const mockPaginate = jest.fn();
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        paginate: mockPaginate
    }))
}));

const octokit = new Octokit();

afterEach(() => {
    mockPaginate.mockClear();
});

describe('getPreviousIssueComment', () => {
    const PR_NUMBER = 1;
    const EXPECTED_COMMENT_ID = 12345;

    test('gets previous comment in pr', async () => {
        const EXPECTED_COMMENT = {
            id: EXPECTED_COMMENT_ID,
            body: [
                '<!-- jest coverage ratchet action for working directory: testDir -->',
                '## Test Coverage Ratchet',
                '```',
                'Coverage comparison details here',
                '```'
            ].join('\n')
        };

        mockPaginate.mockResolvedValue([EXPECTED_COMMENT]);
        const result = await getPreviousComment({
            octokit,
            repo: CONTEXT,
            pullRequestNumber: PR_NUMBER,
            workingDirectory: 'testDir'
        });

        expect(mockPaginate).toHaveBeenCalledTimes(1);
        expect(mockPaginate).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
            {
                ...CONTEXT,
                issue_number: PR_NUMBER
            }
        );

        expect(result).toBe(EXPECTED_COMMENT);
    });

    test('returns undefined when no comment matches meta tag', async () => {
        const randomComment = {
            id: 54321,
            body: 'This is some random comment'
        };

        mockPaginate.mockResolvedValue([randomComment]);
        const result = await getPreviousComment({
            octokit,
            repo: CONTEXT,
            pullRequestNumber: PR_NUMBER,
            workingDirectory: 'testDir'
        });

        expect(mockPaginate).toHaveBeenCalledTimes(1);
        expect(mockPaginate).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
            {
                ...CONTEXT,
                issue_number: PR_NUMBER
            }
        );

        expect(result).toBe(undefined);
    });

    test('returns undefined when searched comment has no body', async () => {
        const randomComment = {
            id: 54321
        };

        mockPaginate.mockResolvedValue([randomComment]);
        const result = await getPreviousComment({
            octokit,
            repo: CONTEXT,
            pullRequestNumber: PR_NUMBER,
            workingDirectory: 'testDir'
        });

        expect(mockPaginate).toHaveBeenCalledTimes(1);
        expect(mockPaginate).toHaveBeenCalledWith(
            'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
            {
                ...CONTEXT,
                issue_number: PR_NUMBER
            }
        );

        expect(result).toBe(undefined);
    });
});
