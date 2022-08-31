import type { CoverageReport } from './coverageTypes';

export interface CoverageDifference {
    name: string
    statements: number
    branches: number
    functions: number
    lines: number
}

interface ComparisonProps {
    baseCoverageReport: CoverageReport
    newCoverageReport: CoverageReport
}
interface ComparisonReturns {
    coverageDifferences: CoverageDifference[]
    missingTests: string[]
}

export default function compareCoverage({
    baseCoverageReport,
    newCoverageReport
}: ComparisonProps): ComparisonReturns {
    const coverageDifferences: CoverageDifference[] = [];
    const missingTests: string[] = [];

    Object.entries(baseCoverageReport).forEach(([key, baseReport]) => {
        const newFileReport = newCoverageReport[key];
        if (newFileReport) {
            // this file is covered in both reports
            const comparison: CoverageDifference = {
                name: key,
                statements: newFileReport.statements.pct - baseReport.statements.pct,
                branches: newFileReport.branches.pct - baseReport.branches.pct,
                functions: newFileReport.statements.pct - baseReport.functions.pct,
                lines: newFileReport.statements.pct - baseReport.lines.pct
            };

            coverageDifferences.push(comparison);
        }
        else {
            // this file is not covered in the new report
            missingTests.push(key);
        }
    });

    return {
        coverageDifferences,
        missingTests
    };
}
