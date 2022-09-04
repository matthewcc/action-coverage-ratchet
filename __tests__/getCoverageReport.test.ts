import getCoverageReport from '../src/getCoverageReport';

describe('getCoverageReport', () => {
    test('returns the coverage report', async () => {
        const report = await getCoverageReport('__tests__/mocks/coverage-summary/medium.json');

        expect(report?.['path/to/file.js']).toBeDefined();
        expect(report?.total?.functions?.pct).toBe(50);
    });

    test('throws error', async () => {
        await expect(async () => {
            await getCoverageReport('does/not/exist.json');
        }).rejects.toThrow();
    });
});
