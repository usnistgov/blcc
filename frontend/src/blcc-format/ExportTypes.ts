import type {
	AnnualCostTypeNpvCashflowRow,
	AlternativeNpvCostTypeTotalRow,
	CategorySubcategoryRow,
	LccBaselineRow,
	LccComparisonRow,
	NpvCashflowComparisonRow,
	ResourceUsageRow,
	LCCResourceRow,
} from "util/ResultCalculations";

export type Summary = {
	lccBaseline: LccBaselineRow[];
	lccResourceRows: LCCResourceRow[];
	lccComparisonRows: LccComparisonRow[];
	npvCosts: CategorySubcategoryRow[];
};

export type Annual = {
	alternativeNpvCashflows: AnnualCostTypeNpvCashflowRow[][];
	npvCashflowComparison: NpvCashflowComparisonRow[];
	npvCashflowComparisonSummary: NpvCashflowComparisonSummary;
};

export type AltResults = {
	alternativeNpvByCostType: AlternativeNpvCostTypeTotalRow[][];
	resourceUsage: ResourceUsageRow[][];
};

export type NpvCashflowComparisonSummary = {
	[key: string]: number | string;
};

export type GraphSources = {
	annualCashFlows: string;
	cashFlowBySubtype: string[];
	shareOfLcc: string[];
	shareOfEnergyUse: string[];
};
