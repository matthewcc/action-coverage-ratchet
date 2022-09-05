import { readFile } from 'fs/promises';

import type { CoverageReport } from './jestCoverageReportTypes';

export default async function getCoverageReport(pathToSummary: string): Promise<CoverageReport> {
    let coverageRaw;

    try {
        coverageRaw = await readFile(pathToSummary);
    }
    catch {
        throw new Error(`Unable to read coverage report: ${pathToSummary}`);
    }

    const stringified = coverageRaw.toString();
    const report = JSON.parse(stringified) as CoverageReport;

    return report;
}
