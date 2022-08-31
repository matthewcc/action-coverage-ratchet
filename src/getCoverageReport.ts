import * as core from '@actions/core';
import { readFile } from 'fs/promises';

import type { CoverageReport } from './coverageTypes';

export default async function getCoverageReport(path?: string): Promise<CoverageReport | undefined> {
    const dir = core.getInput('working-directory');
    const pathToSummary = path || `${dir}/coverage/coverage-summary.json`;

    let coverageRaw;

    try {
        coverageRaw = await readFile(pathToSummary);
    }
    catch (err) {
        if (err instanceof Error) {
            core.setFailed(`Error reading coverage report: ${err.message}`);
        }
        else {
            core.setFailed('Unknown error reading coverage report');
        }
    }

    if (!coverageRaw) {
        core.setFailed('Unable to read coverage report');
        return undefined;
    }

    const stringified = coverageRaw.toString();

    return JSON.parse(stringified) as CoverageReport;
}
