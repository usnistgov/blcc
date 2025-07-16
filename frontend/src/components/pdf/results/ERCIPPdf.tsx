import { View, Text } from "@react-pdf/renderer";
import { Grid, LabeledText, Title } from "../components/GeneralComponents";
import { styles } from "../pdfStyles";
import {
    CostTypes,
    type ERCIPCost,
    type Alternative,
    type Cost,
    type Project,
    type USLocation,
} from "blcc-format/Format";
import { Country } from "constants/LOCATION";
import { dollarFormatter, numberFormatter, percentFormatter } from "util/Util";
import type { ERCIPData } from "blcc-format/ExportTypes";

type ERCIPPdfProps = {
    project: Project;
    alternative: Alternative;
    costs: Cost[];
    ercip: ERCIPData;
};

export default function ERCIPPdf({ project, alternative, costs, ercip }: ERCIPPdfProps) {
    return (
        <View style={styles.section} break>
            <Title title="NIST BLCC ERCIP Report" />
            <Text style={styles.subTitle}>
                Consistent with Federal Life Cycle Cost Methodology and Procedures, 10 CFR, Part 436, Subpart A
            </Text>
            <Text style={styles.text}>
                The LCC calculations are based on the FEMP discount rates and energy price escalation rates for 2025.
            </Text>

            <Assumptions project={project} />
            <InvestmentCosts alternative={alternative} costs={costs} />
            <EnergyAndWaterSavings ercip={ercip} />
            <NonEnergySavings ercip={ercip} />
            <Metrics ercip={ercip} />
        </View>
    );
}

function Assumptions({ project }: { project: Project }) {
    const location =
        project.location.country === Country.USA ? (project.location as USLocation).zipcode : project.location.country;
    return (
        <>
            <Text style={styles.heading}>Assumptions</Text>
            <View style={{ ...styles.container, margin: 0 }} wrap={true}>
                <View style={styles.key}>
                    <LabeledText containerStyle={styles.item} label="Location" text={location} />
                    <LabeledText
                        containerStyle={styles.item}
                        label="Discount Rate"
                        text={`${percentFormatter.format(project.realDiscountRate ?? 0)}`}
                    />
                </View>
                <View style={styles.key}>
                    <LabeledText containerStyle={styles.item} label="Project Title" text={`${project.name}`} />
                    <LabeledText containerStyle={styles.item} label="Analyst" text={project.analyst} />
                </View>
                <View style={styles.key}>
                    <LabeledText containerStyle={styles.item} label="Base Year" text={`${project.releaseYear}`} />
                    <LabeledText containerStyle={styles.item} label="Date/Time" text={new Date().toLocaleString()} />
                </View>
                <View style={styles.key}>
                    <LabeledText
                        containerStyle={styles.item}
                        label="Service Year"
                        text={`${project.releaseYear + project.constructionPeriod}`}
                    />
                    <LabeledText
                        containerStyle={styles.item}
                        label="Study Period"
                        text={`${project.studyPeriod ?? 0}`}
                    />
                </View>
            </View>
        </>
    );
}

function InvestmentCosts({ alternative, costs }: { alternative: Alternative; costs: Cost[] }) {
    const ERCIP = costs.filter(
        (cost) => cost.type === CostTypes.ERCIP && alternative.costs.includes(cost.id),
    )[0] as ERCIPCost;

    const totalCost = ERCIP.constructionCost + ERCIP.SIOH + ERCIP.designCost;
    const totalInvestment = totalCost - ERCIP.salvageValue - ERCIP.publicUtilityRebate - ERCIP.cybersecurity;

    const rowsABC = [
        { key: 0, category: "A - Construction Cost", cost: ERCIP.constructionCost },
        { key: 1, category: "B - SIOH", cost: ERCIP.SIOH },
        { key: 2, category: "C - Design Cost", cost: ERCIP.designCost },
        { key: 3, category: "D - Total Cost (A+ B+ C)", cost: totalCost },
    ];

    const rowsDEF = [
        { key: 0, category: "E - Salvage Value of Existing Equipment", cost: ERCIP.salvageValue },
        { key: 1, category: "F - Public Utility Company Rebate", cost: ERCIP.publicUtilityRebate },
        { key: 2, category: "G - Cybersecurity (Assess & Authorize)", cost: ERCIP.cybersecurity },
        {
            key: 3,
            category: "Total Investment (D - E - F)",
            cost: totalInvestment,
        },
    ];

    const cols = [
        { name: "Category", key: "category" },
        { name: "$", key: "cost", formatter: dollarFormatter },
    ];

    return (
        <>
            <Text style={styles.heading}>Investment Costs</Text>
            <View style={{ flexDirection: "row", columnGap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Grid rows={rowsABC} columns={cols} />
                </View>
                <View style={{ flex: 1 }}>
                    <Grid rows={rowsDEF} columns={cols} />
                </View>
            </View>
        </>
    );
}

function EnergyAndWaterSavings({ ercip }: { ercip: ERCIPData }) {
    const energyCosts = ercip.costs.filter((cost) => cost.type === CostTypes.ENERGY);
    console.log(energyCosts);

    const cols = [
        { name: "Energy Source Name", key: "name" },
        { name: "Unit", key: "unit" },
        { name: "Base Year Cost/Unit", key: "baseYearCostPerUnit" },
        { name: "Year 1 Consumption Savings", key: "y1ConsSavings" },
        { name: "Initial Annual Savings", key: "initAnnualSavings" },
        { name: "Discounted Savings", key: "discountSavings" },
    ];

    let energyRows: {
        name: string;
        unit: string;
        baseYearCostPerUnit: string;
        y1ConsSavings: string;
        initAnnualSavings: string;
        discountSavings: string;
    }[] = [];

    for (const cost of energyCosts) {
        const costOpt = ercip.optionals.find((opt) => opt.tag === `${cost.id}`);
        const demandChargeOpt = ercip.optionals.find((opt) => opt.tag === `Demand Charge - ${cost.id}`);
        const rebateOpt = ercip.optionals.find((opt) => opt.tag === `Rebate - ${cost.id}`);

        energyRows = energyRows.concat({
            name: cost.name,
            unit: cost.unit.toString(),
            baseYearCostPerUnit: dollarFormatter.format(cost.costPerUnit),
            y1ConsSavings: dollarFormatter.format(costOpt?.totalTagQuantity[1 + ercip.constructionPeriod] ?? 0),
            initAnnualSavings: dollarFormatter
                .format(costOpt?.totalTagCashflowDiscounted[1 + ercip.constructionPeriod] ?? 0)
                .toString(),
            discountSavings: dollarFormatter
                .format(costOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0)
                .toString(),
        });

        if (demandChargeOpt != null) {
            energyRows = energyRows.concat({
                name: `${cost.name} - Demand Charge`,
                unit: "",
                baseYearCostPerUnit: "",
                y1ConsSavings: "",
                initAnnualSavings: dollarFormatter
                    .format(demandChargeOpt?.totalTagCashflowDiscounted[1 + ercip.constructionPeriod] ?? 0)
                    .toString(),
                discountSavings: dollarFormatter
                    .format(demandChargeOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0)
                    .toString(),
            });
        }

        if (rebateOpt != null) {
            energyRows = energyRows.concat({
                name: `${cost.name} - Rebate`,
                unit: "",
                baseYearCostPerUnit: "",
                y1ConsSavings: "",
                initAnnualSavings: dollarFormatter
                    .format(rebateOpt?.totalTagCashflowDiscounted[1 + ercip.constructionPeriod] ?? 0)
                    .toString(),
                discountSavings: dollarFormatter
                    .format(rebateOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0)
                    .toString(),
            });
        }
    }

    const demandChargeOpt = ercip.optionals.find((opt) => opt.tag === "Demand Charge");
    const demandChargeTotal = demandChargeOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0;

    const rebateOpt = ercip.optionals.find((opt) => opt.tag === "Rebate");
    const rebateTotal = rebateOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0;

    const energyOpt = ercip.optionals.find((opt) => opt.tag === "Energy");

    const energyTotal =
        (energyOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0) +
        demandChargeTotal +
        rebateTotal;

    const waterOpt = ercip.optionals.find((opt) => opt.tag === "Water");
    const waterTotal = waterOpt?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0;

    const energyWaterTotal = energyTotal + waterTotal;

    const rows = energyRows.concat([
        {
            name: "Energy Total:",
            unit: "",
            baseYearCostPerUnit: "",
            y1ConsSavings: "",
            initAnnualSavings: "",
            discountSavings: `${dollarFormatter.format(energyTotal)}`,
        },
        {
            name: "Water Total:",
            unit: "",
            baseYearCostPerUnit: "",
            y1ConsSavings: "",
            initAnnualSavings: "",
            discountSavings: `${dollarFormatter.format(waterTotal)}`,
        },
        {
            name: "Energy and Water Total:",
            unit: "",
            baseYearCostPerUnit: "",
            y1ConsSavings: "",
            initAnnualSavings: "",
            discountSavings: `${dollarFormatter.format(energyWaterTotal)}`,
        },
    ]);

    return (
        <>
            <Text style={styles.heading}>Energy and Water Savings</Text>
            <Grid rows={rows} columns={cols} />
            <Text style={styles.text}>
                Note: Excluded discount factors because they might not be appropriate if consumption estimates are not
                constant
            </Text>
        </>
    );
}

function NonEnergySavings({ ercip }: { ercip: ERCIPData }) {
    const nonEnergyCosts = ercip.costs.filter(
        (cost) => cost.type !== CostTypes.ENERGY && cost.type !== CostTypes.ERCIP,
    );

    const cols = [
        { name: "Tag", key: "tag" },
        { name: "Discounted Savings", key: "savings" },
    ];

    const costRows = nonEnergyCosts.map((cost) => {
        return {
            tag: cost.name,
            savings: dollarFormatter.format(
                ercip.optionals
                    .find((opt) => opt.tag === `${cost.id}`)
                    ?.totalTagCashflowDiscounted.reduce((prev, curr) => prev + curr, 0) ?? 0,
            ),
        };
    });

    const rows = costRows.concat({
        tag: "Total",
        savings: dollarFormatter.format(ercip.measures.totalCostNonInvest - (ercip.measures.totalTagFlows.Energy ?? 0)),
    });

    return (
        <>
            <Text style={styles.heading}>Non-Energy Savings</Text>
            <Grid rows={rows} columns={cols} />
            <Text style={styles.text}>
                Note: Excluded discount factors because they might not be appropriate if consumption estimates are not
                constant
            </Text>
        </>
    );
}

function Metrics({ ercip }: { ercip: ERCIPData }) {
    const cols = [
        { name: "Metrics", key: "metrics" },
        { name: "Value", key: "value" },
        { name: "Unit", key: "unit" },
    ];

    const rows = [
        {
            metrics: "First Year Savings",
            value: numberFormatter.format(ercip.required.totalCostsDiscounted[1 + ercip.constructionPeriod]),
            unit: "$",
        },
        {
            metrics: "Total Operational Net Discounted Savings",
            value: numberFormatter.format(ercip.measures.totalCostNonInvest),
            unit: "$",
        },
        {
            metrics: "Total Net Savings",
            value: numberFormatter.format(ercip.required.totalCostsDiscounted.reduce((prev, curr) => prev + curr, 0)),
            unit: "$",
        },
        { metrics: "Simple Payback Period", value: numberFormatter.format(ercip.measures.spp), unit: "Years" },
        { metrics: "Discounted Payback Period", value: numberFormatter.format(ercip.measures.dpp), unit: "Years" },
        { metrics: "Savings to Investment Ratio (SIR)", value: numberFormatter.format(ercip.measures.sir), unit: "" },
        { metrics: "Adjusted Internal Rate of Return", value: numberFormatter.format(ercip.measures.airr), unit: "%" },
    ];

    return (
        <>
            <Text style={styles.heading}>Metrics</Text>
            <Grid rows={rows} columns={cols} />
        </>
    );
}
