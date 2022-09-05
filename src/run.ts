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
        if (context.eventName !== 'pull_request') {
            core.setFailed('This action only works with pull requests.');
            return;
        }

        if (!context.payload?.pull_request?.number) {
            core.setFailed('No pull request found.');
            return;
        }

        const currentBranch = process.env.GITHUB_HEAD_REF;

        if (!currentBranch || currentBranch === 'undefined') {
            core.setFailed('Error looking up current pull request branch.');
            return;
        }

        const testScript = core.getInput('test_script');

        if (!testScript || testScript === 'undefined') {
            core.setFailed('No test_script provided.');
            return;
        }

        const githubToken = core.getInput('github_token');

        if (!githubToken || githubToken === 'undefined') {
            core.setFailed('No github_token provided.');
            return;
        }

        const workingDirectory = core.getInput('working_directory');
        const coverageSummaryPath = core.getInput('coverage_summary_path');
        const pathToSummary = `${workingDirectory}/${coverageSummaryPath}`;

        const margin = parseInt(core.getInput('margin'), 10);

        if (Number.isNaN(margin)) {
            core.setFailed(`Margin must be a number. Received "${core.getInput('margin')}".`);
            return;
        }

        if (margin < 0 || margin > 100) {
            core.setFailed(`Margin must be between 0 and 100. Received ${margin}.`);
            return;
        }

        const mainBranchName = core.getInput('default_branch');

        await switchBranch(mainBranchName, true);
        await exec(testScript);

        let currentCoverageReport;

        try {
            currentCoverageReport = await getCoverageReport(pathToSummary);
        }
        catch {
            core.setFailed(`Unable read file: ${pathToSummary}`);
            return;
        }

        await switchBranch(currentBranch);
        await exec(testScript);

        let incomingCoverageReport;

        try {
            incomingCoverageReport = await getCoverageReport(pathToSummary);
        }
        catch {
            core.setFailed(`Unable read file: ${pathToSummary}`);
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
        else if (coverageComparison.averageCoverageChange > 0) {
            core.info('Coverage has increased');
        }
        else {
            core.info('Coverage has not changed');
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
            core.info(err.message);
        }

        core.setFailed('Coverage Ratchet action failed');
    }
}
