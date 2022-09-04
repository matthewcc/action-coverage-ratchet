import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { exec } from '@actions/exec';

import switchBranch from './switchBranch';
import getCoverageReport from './getCoverageReport';
import getPreviousComment from './getPreviousComment';
import compareCoverage from './compareCoverage';
import createComment from './createComment';

export default async function run(): Promise<void> {
    try {
        if (!context.payload.pull_request?.number) {
            core.setFailed('No pull request found.');
            return;
        }

        const currentBranch = process.env.GITHUB_HEAD_REF;

        if (!currentBranch) {
            core.setFailed('Error looking up current branch.');
            return;
        }

        const workingDirectory = core.getInput('working-directory');
        const mainBranchName = core.getInput('default-branch');
        const testScript = core.getInput('test-script');
        const margin = parseInt(core.getInput('margin'), 10);
        const pathToSummary = `${workingDirectory}/coverage/coverage-summary.json`;

        await switchBranch(mainBranchName, true);
        await exec(testScript);
        const currentCoverageReport = await getCoverageReport(pathToSummary);

        if (!currentCoverageReport) {
            core.setFailed('Unable to get coverage report from default branch');
            return;
        }

        await switchBranch(currentBranch);
        await exec(testScript);
        const incomingCoverageReport = await getCoverageReport(pathToSummary);

        if (!incomingCoverageReport) {
            core.setFailed('Unable to get coverage report from feature branch');
            return;
        }

        const coverageComparison = compareCoverage({
            currentCoverageReport,
            incomingCoverageReport
        });

        const body = createComment({
            coverageComparison,
            workingDirectory,
            margin
        });

        const githubToken = core.getInput('github-token');
        const pullRequestNumber = context.payload.pull_request.number;
        const octokit = getOctokit(githubToken);

        const previousReport = await getPreviousComment({
            octokit,
            repo: context.repo,
            pullRequestNumber,
            workingDirectory
        });

        if (coverageComparison.coverageHasDeclined) {
            core.setFailed('Coverage has declined');
        }

        if (previousReport) {
            core.info('Appending pre-existing comment');

            await octokit.rest.issues.updateComment({
                ...context.repo,
                body,
                comment_id: previousReport.id
            });
        }
        else {
            core.info('Creating new comment');

            await octokit.rest.issues.createComment({
                ...context.repo,
                body,
                issue_number: pullRequestNumber
            });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            core.setFailed(err.message);
        }
        else {
            core.setFailed('Coverage Ratchet action failed');
        }
    }
}
