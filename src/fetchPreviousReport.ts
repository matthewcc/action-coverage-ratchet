import { getOctokit } from '@actions/github';

import { metaComment } from './generateComment';

interface PreviousReportProps {
    octokit: ReturnType<typeof getOctokit>,
    repo: { owner: string; repo: string },
    pr: { number: number },
    workingDirectory: string
}

export default async function fetchPreviousReport(props: PreviousReportProps) {
    const {
        octokit,
        repo,
        pr,
        workingDirectory
    } = props;

    const commentList = await octokit.paginate(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
        {
            ...repo,
            issue_number: pr.number
        }
    );

    const previousReport = commentList.find(
        comment => comment.body?.startsWith(metaComment(workingDirectory))
    );

    return !previousReport ? null : previousReport;
}
