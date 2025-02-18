import type {
    AnnualCostTypeNpvCashflowRow,
    AlternativeNpvCostTypeTotalRow,
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
    alternativeNpvCashflows: AnnualCostTypeNpvCashflowRow[][];
    npvCashflowComparison: NpvCashflowComparisonRow[];
};

export type AltResults = {
    alternativeNpvCashflowTotal: AlternativeNpvCostTypeTotalRow[][];
    resourceUsage: ResourceUsageRow[][];
};
