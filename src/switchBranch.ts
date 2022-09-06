import { exec } from '@actions/exec';

const switchBranch = async (branch: string, gitFetch = false) => {
    if (gitFetch) {
        try {
            await exec('git fetch --all --depth=1');
        }
        catch (err) {
            let msg = 'Error on "git fetch --all --depth=1"';
            if (err instanceof Error) {
                msg = `${msg}: ${err.message}`;
            }

            throw new Error(msg);
        }
    }

    try {
        await exec(`git checkout -f ${branch}`);
    }
    catch (err) {
        let msg = `Error on "git checkout -f ${branch}"`;
        if (err instanceof Error) {
            msg = `${msg}: ${err.message}`;
        }

        throw new Error(msg);
    }
};

export default switchBranch;
