import * as core from '@actions/core';
import { exec } from '@actions/exec';

const switchBranch = async (branch: string, gitFetch = false) => {
    core.info(`switching to branch: ${branch}`);

    if (gitFetch) {
        try {
            await exec('git fetch --all --depth=1');
        }
        catch (err) {
            if (err instanceof Error) {
                core.setFailed(`Unable to fetch branches: ${err.message}`);
            }
            else {
                core.setFailed('Unable to fetch branches');
            }
        }
    }

    await exec(`git checkout -f ${branch}`);
};

export default switchBranch;
