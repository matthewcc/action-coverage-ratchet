import { exec } from '@actions/exec';

const switchBranch = async (branch: string, gitFetch = false) => {
    if (gitFetch) {
        try {
            await exec('git fetch --all --depth=1');
        }
        catch (err) {
            let msg = 'Unable to fetch branches';
            if (err instanceof Error) {
                msg = `${msg}: ${err.message}`;
            }

            throw new Error(msg);
        }
    }

    await exec(`git checkout -f ${branch}`);
};

export default switchBranch;
