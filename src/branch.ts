import * as core from '@actions/core';
import { exec } from '@actions/exec';

export const switchBranch = async (branch: string) => {
    try {
        core.debug(`switching to branch: ${branch}`);
        await exec('git fetch --all --depth=1');
    }
    catch (err) {
        console.warn('Error fetching git repository', err);
    }

    await exec(`git checkout -f ${branch}`);
};

export const switchBack = async () => {
    try {
        core.debug('switching back to feature');
        await exec('git checkout -');
    }
    catch (err) {
        console.warn('Error checking to branches', err);
    }
};
