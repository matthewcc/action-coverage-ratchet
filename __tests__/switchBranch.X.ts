import actionsExec from '@actions/exec';

import switchBranch from '../src/switchBranch';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const execActual = jest.requireActual('@actions/exec');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const execBase = {
    ...execActual,
    exec: jest.fn()
};

beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.mock('@actions/exec', () => execBase);
});

describe('switchBranch', () => {
    test('checks out specified branch', async () => {
        await expect(switchBranch('feature/some-feature')).resolves.toBeUndefined();
        expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
        expect(actionsExec.exec).toHaveBeenCalledTimes(1);
    });

    /* test('fetches then checks out specified branch', async () => {
           await expect(switchBranch('feature/some-feature', true)).resolves.toBeUndefined();
           expect(actionsExec.exec).toHaveBeenCalledWith('git fetch --all --depth=1');
           expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
           expect(actionsExec.exec).toHaveBeenCalledTimes(2);
       }); */

    /* test('switchBranch fails', async () => {
           jest.mock('@actions/exec', () => (
               // eslint-disable-next-line @typescript-eslint/no-unsafe-return
               {
                   ...execActual,
                   exec: () => {
                       throw new Error('Unable to fetch branches');
                   }
               }
           )); */

    /*     await expect(switchBranch('feature/some-feature', true)).rejects.toEqual(new Error('Unable to fetch branches'));
           expect(actionsExec.exec).toHaveBeenCalledWith('git fetch --all --depth=1');
           expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
           expect(actionsExec.exec).toHaveBeenCalledTimes(2);
       }); */
});
