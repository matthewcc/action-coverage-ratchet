import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { exec } from '@actions/exec';

import { switchBranch, switchBack } from './branch';
import getCoverageReport from './getCoverageReport';

export default async function run(): Promise<void> {
    try {
        if (!context.payload.pull_request?.number) {
            core.setFailed('No pull request found.');
            return;
        }

        // const mainBranchName = core.getInput('default-branch');
        const testScript = core.getInput('test-script');

        // await switchBranch(mainBranchName);
        await exec(testScript);

        const coverageReport = await getCoverageReport();

        console.log({ coverageReport });

        const githubToken = core.getInput('github-token');
        const pullRequestNumber = context.payload.pull_request.number;
        const octokit = getOctokit(githubToken);

        await octokit.rest.issues.createComment({
            ...context.repo,
            body: 'This is a test comment',
            issue_number: pullRequestNumber
        });
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
