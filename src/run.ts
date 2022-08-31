import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { exec } from '@actions/exec';

import { switchBranch, switchBack } from './branch';
import getCoverageReport from './getCoverageReport';
import compareCoverage from './compareCoverage';
import checkForDecline from './checkForDecline';
import fetchPreviousReport from './fetchPreviousReport';
import generateComment from './generateComment';

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
        const verboseAnnotations = core.getInput('verbose-annotations') === 'true';
        const margin = parseInt(core.getInput('margin'), 10);

        await switchBranch(mainBranchName);
        await exec(testScript);
        const baseCoverageReport = await getCoverageReport();

        if (!baseCoverageReport) {
            core.setFailed('Unable to get coverage report from default branch');
            return;
        }

        // await switchBack();
        await switchBranch(currentBranch);
        await exec(testScript);
        const newCoverageReport = await getCoverageReport();

        if (!newCoverageReport) {
            core.setFailed('Unable to get coverage report from feature branch');
            return;
        }

        const { coverageDifferences } = compareCoverage({
            baseCoverageReport,
            newCoverageReport
        });

        const coverageHasDeclined = checkForDecline({
            coverageDifferences,
            margin
        });

        const githubToken = core.getInput('github-token');
        const pullRequestNumber = context.payload.pull_request.number;
        const octokit = getOctokit(githubToken);

        const previousReport = await fetchPreviousReport({
            octokit,
            repo: context.repo,
            pr: { number: pullRequestNumber },
            workingDirectory
        });

        if (coverageHasDeclined) {
            core.setFailed('Coverage has declined');
        }

        const body = generateComment({
            coverageDifferences,
            coverageHasDeclined,
            verboseAnnotations,
            workingDirectory
        });

        if (previousReport) {
            await octokit.rest.issues.updateComment({
                ...context.repo,
                body,
                comment_id: previousReport.id
            });
        }
        else {
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
