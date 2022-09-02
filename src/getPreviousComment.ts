import { getOctokit } from '@actions/github';

import { metaComment } from './generateComment';

export default async function getPreviousComment({
    octokit,
    repo,
    pullRequestNumber,
    workingDirectory
}: {
    octokit: ReturnType<typeof getOctokit>
    repo: { owner: string; repo: string }
    pullRequestNumber: number
    workingDirectory: string
}) {
    const commentList = await octokit.paginate(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
        {
            ...repo,
            issue_number: pullRequestNumber
        }
    );

    const previousReport = commentList.find(
        comment => comment.body?.startsWith(metaComment(workingDirectory))
    );

    return !previousReport ? null : previousReport;
}
