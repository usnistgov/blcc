import type {
    AlternativeNpvCashflowRow,
    AlternativeNpvCashflowTotalRow,
    CategorySubcategoryRow,
    LccBaselineRow,
    LccComparisonRow,
    NpvCashflowComparisonRow,
    ResourceUsageRow,
} from "util/ResultCalculations";

export type Summary = {
    lccBaseline: LccBaselineRow[];
    lccResourceRows: CategorySubcategoryRow[];
    lccComparisonRows: LccComparisonRow[];
    npvCosts: CategorySubcategoryRow[];
};

export type Annual = {
    alternativeNpvCashflows: AlternativeNpvCashflowRow[][];
    npvCashflowComparison: NpvCashflowComparisonRow[];
};

export type AltResults = {
    alternativeNpvCashflowTotal: AlternativeNpvCashflowTotalRow[][];
    resourceUsage: ResourceUsageRow[][];
};
