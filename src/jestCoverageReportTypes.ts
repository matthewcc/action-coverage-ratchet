interface CoveredCategory {
    total: number
    covered: number
    skipped: number
    pct: number
}

interface Covered {
    lines: CoveredCategory
    statements: CoveredCategory
    functions: CoveredCategory
    branches: CoveredCategory
    branchesTrue?: CoveredCategory
}

export interface CoverageReport {
    [key: string]: Covered
}
