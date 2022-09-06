import * as actionsExec from '@actions/exec';

import switchBranch from '../src/switchBranch';

const mockExec = jest
    .spyOn(actionsExec, 'exec')
    .mockImplementation(jest.fn());

describe('switchBranch', () => {
    test('git checkout a branch', async () => {
        await expect(switchBranch('feature/some-feature')).resolves.toBeUndefined();
        expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
        expect(actionsExec.exec).toHaveBeenCalledTimes(1);
    });

    test('git fetch then git checkout a branch', async () => {
        await expect(switchBranch('feature/some-feature', true)).resolves.toBeUndefined();
        expect(actionsExec.exec).toHaveBeenCalledWith('git fetch --all --depth=1');
        expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
        expect(actionsExec.exec).toHaveBeenCalledTimes(2);
    });

    test('switchBranch throws on git fetch', async () => {
        mockExec.mockImplementation(() => {
            throw new Error('Test error');
        });

        await expect(switchBranch('feature/some-feature', true))
            .rejects.toEqual(new Error('Error on "git fetch --all --depth=1": Test error'));
        expect(actionsExec.exec).toHaveBeenCalledWith('git fetch --all --depth=1');
        expect(actionsExec.exec).not.toHaveBeenCalledWith('git checkout -f feature/some-feature');
        expect(actionsExec.exec).toHaveBeenCalledTimes(1);

        mockExec.mockReset();
    });

    test('switchBranch throws on git checkout', async () => {
        mockExec.mockImplementation(() => {
            throw new Error('Mock error');
        });

        await expect(switchBranch('feature/some-feature'))
            .rejects.toEqual(new Error('Error on "git checkout -f feature/some-feature": Mock error'));
        expect(actionsExec.exec).not.toHaveBeenCalledWith('git fetch --all --depth=1');
        expect(actionsExec.exec).toHaveBeenCalledWith('git checkout -f feature/some-feature');
        expect(actionsExec.exec).toHaveBeenCalledTimes(1);

        mockExec.mockReset();
    });
});
