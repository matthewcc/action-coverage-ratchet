/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import actionsExec from '@actions/exec';

import { getMetaComment } from '../src/createComment';
import * as compareCoverage from '../src/compareCoverage';
import * as getCoverageReport from '../src/getCoverageReport';
import switchBranch from '../src/switchBranch';
import run from '../src/run';

import type { CoverageReport } from '../src/jestCoverageReportTypes';
import type { CoverageComparison } from '../src/compareCoverage';

const decliningMock = fs.readFileSync('__tests__/mocks/coverage-difference/decline.json');
const declineComparison = JSON.parse(decliningMock.toString()) as CoverageComparison;

const improveMock = fs.readFileSync('__tests__/mocks/coverage-difference/improve.json');
const improveComparison = JSON.parse(improveMock.toString()) as CoverageComparison;

const unchangedMock = fs.readFileSync('__tests__/mocks/coverage-difference/unchanged.json');
const unchangedComparison = JSON.parse(unchangedMock.toString()) as CoverageComparison;

const mediumCoverageMock = fs.readFileSync('__tests__/mocks/coverage-summary/medium.json');
const mediumCoverageReport = JSON.parse(mediumCoverageMock.toString()) as CoverageReport;

jest.mock('@actions/exec', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@actions/exec');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        exec: jest.fn()
    };
});

jest.mock('@actions/core', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@actions/core');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        info: jest.fn(),
        setFailed: jest.fn(),
        debug: jest.fn()
    };
});

jest.mock('../src/switchBranch');

const switchBranchMock = jest.mocked(switchBranch);

function mockGithubContext(context: unknown) {
    Object.defineProperty(github, 'context', {
        value: context
    });
}

function mockGithubGetOctokit(getOctokit: unknown) {
    Object.defineProperty(github, 'getOctokit', {
        value: getOctokit
    });
}

const mockCreateComment = jest.fn();
const mockUpdateComment = jest.fn();

const octokitMockBase = {
    paginate: () => [],
    rest: {
        issues: {
            createComment: mockCreateComment,
            updateComment: mockUpdateComment
        }
    }
};

beforeEach(() => {
    mockGithubGetOctokit(() => octokitMockBase);
    mockGithubContext({
        eventName: 'pull_request',
        payload: {
            pull_request: {
                number: 1
            }
        },
        repo: {
            owner: 'alice',
            repo: 'example'
        }
    });

    switchBranchMock.mockClear();
    mockCreateComment.mockClear();
    mockUpdateComment.mockClear();

    process.env.INPUT_WORKING_DIRECTORY = '__tests__/mocks';
    process.env.INPUT_COVERAGE_SUMMARY_PATH = 'coverage-summary/medium.json';
    process.env.INPUT_DEFAULT_BRANCH = 'main';
    process.env.INPUT_TEST_SCRIPT = 'yarn test';
    process.env.INPUT_MARGIN = '0';
    process.env.INPUT_GITHUB_TOKEN = '***';
    process.env.GITHUB_HEAD_REF = 'feature-branch';
});

describe('run: success states', () => {
    test('creates new comment', async () => {
        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(actionsExec.exec).toHaveBeenCalledWith('yarn test');
        expect(actionsExec.exec).toHaveBeenCalledTimes(2);
        expect(core.info).toHaveBeenCalledWith('Creating new comment');
    });

    test('updates previous comment', async () => {
        mockGithubGetOctokit(() => (
            {
                ...octokitMockBase,
                paginate: () => [{
                    body: getMetaComment(process.env.INPUT_WORKING_DIRECTORY as string)
                }]
            }
        ));

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).toHaveBeenCalled();
        expect(core.info).toHaveBeenCalledWith('Appending pre-existing comment');
    });

    test('coverage has declined', async () => {
        const spy = jest.spyOn(compareCoverage, 'default').mockImplementation(() => declineComparison);

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed).toHaveBeenCalledWith('Coverage has declined');

        spy.mockRestore();
    });

    test('coverage has improved', async () => {
        const spy = jest.spyOn(compareCoverage, 'default').mockImplementation(() => improveComparison);

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.info).toHaveBeenCalledWith('Coverage has increased');

        spy.mockRestore();
    });

    test('coverage is unchanged', async () => {
        const spy = jest.spyOn(compareCoverage, 'default').mockImplementation(() => unchangedComparison);

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.info).toHaveBeenCalledWith('Coverage has not changed');

        spy.mockRestore();
    });
});

describe('run: fail states with bad action inputs', () => {
    test('fails with bad working_directory', async () => {
        process.env.INPUT_WORKING_DIRECTORY = 'bad-directory/nope/nada';

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith('Unable read file: bad-directory/nope/nada/coverage-summary/medium.json');
    });

    test('fails with bad coverage_summary_path', async () => {
        process.env.INPUT_COVERAGE_SUMMARY_PATH = 'non-existent/report.json';
        const dir = process.env.INPUT_WORKING_DIRECTORY as string;

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith(`Unable read file: ${dir}/non-existent/report.json`);
    });

    test('fails without test_script', async () => {
        process.env.INPUT_TEST_SCRIPT = '';

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith('No test_script provided.');
    });

    test('fails without github_token', async () => {
        process.env.INPUT_GITHUB_TOKEN = '';

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith('No github_token provided.');
    });

    test('fails when margin is NaN', async () => {
        const margin = 'pizza';
        process.env.INPUT_MARGIN = margin;

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith(`Margin must be a number. Received "${margin}".`);
    });

    test('fails when margin is less than 0', async () => {
        const margin = -1;
        process.env.INPUT_MARGIN = margin.toString();

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith(`Margin must be between 0 and 100. Received ${margin}.`);
    });

    test('fails when margin is greater than 100', async () => {
        const margin = 101;
        process.env.INPUT_MARGIN = margin.toString();

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed)
            .toHaveBeenCalledWith(`Margin must be between 0 and 100. Received ${margin}.`);
    });
});

describe('run: fail states with bad github.context', () => {
    test('fails when there is no pull request number', async () => {
        mockGithubContext({
            eventName: 'pull_request',
            repo: {
                owner: 'alice',
                repo: 'example'
            }
        });

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed).toHaveBeenCalledTimes(1);
        expect(core.setFailed).toHaveBeenCalledWith('No pull request found.');
    });

    test('fails when event is not pull_request', async () => {
        mockGithubContext({
            eventName: 'push',
            repo: {
                owner: 'alice',
                repo: 'example'
            }
        });

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed).toHaveBeenCalledTimes(1);
        expect(core.setFailed).toHaveBeenCalledWith('This action only works with pull requests.');
    });
});

describe('run: fail states general', () => {
    test('current branch cannot be determined', async () => {
        process.env.GITHUB_HEAD_REF = undefined;

        await expect(run()).resolves.toBeUndefined();
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(core.setFailed).toHaveBeenCalledWith('Error looking up current pull request branch.');
    });

    test('current coverage report cannot be loaded', async () => {
        const workingDirectory = process.env.INPUT_WORKING_DIRECTORY as string;

        const spy = jest.spyOn(getCoverageReport, 'default')
            .mockImplementationOnce(async () => {
                await Promise.resolve();
                throw new Error();
            });

        await expect(run()).resolves.toBeUndefined();
        expect(core.setFailed)
            .toHaveBeenCalledWith(`Unable read file: ${workingDirectory}/coverage-summary/medium.json`);

        spy.mockRestore();
    });

    test('incoming coverage report cannot be loaded', async () => {
        const file = 'coverage-summary/medium.json';
        const workingDirectory = process.env.INPUT_WORKING_DIRECTORY as string;

        const spy = jest.spyOn(getCoverageReport, 'default')
            .mockImplementationOnce(async () => {
                await Promise.resolve();
                return mediumCoverageReport;
            })
            .mockImplementationOnce(() => {
                throw new Error();
            });

        await expect(run()).resolves.toBeUndefined();
        expect(core.setFailed).toHaveBeenCalledWith(`Unable read file: ${workingDirectory}/${file}`);

        spy.mockRestore();
    });

    test('random error is caught', async () => {
        mockGithubGetOctokit(() => (
            {
                ...octokitMockBase,
                rest: {
                    issues: {
                        createComment: () => {
                            throw new Error('Trigger test error');
                        },
                        updateComment: mockUpdateComment
                    }
                }
            }
        ));

        await expect(run()).resolves.toBeUndefined();
        expect(core.setFailed).toHaveBeenCalled();
    });
});
