import {
    AlternativeBuilder,
    AnalysisBuilder,
    AnalysisType,
    BcnBuilder,
    BcnSubType,
    BcnType,
    ProjectType,
    RecurBuilder,
    RequestBuilder,
    TimestepComp,
    TimestepValue,
    VarRate,
} from "@lrd/e3-sdk";
import {
    type CapitalCost,
    type Cost,
    CostBenefit,
    CostTypes,
    DiscountingMethod,
    DollarMethod,
    DollarOrPercent,
    type EnergyCost,
    FuelType,
    type ImplementationContractCost,
    LiquidUnit,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type Project,
    type RecurringContractCost,
    type ReplacementCapitalCost,
    type ResidualValue,
    type USLocation,
    type WaterCost,
} from "blcc-format/Format";
import { Effect, Match } from "effect";
import { DexieService } from "model/db";
import { BlccApiService } from "services/BlccApiService";
import { convertCostPerUnitToLiters, convertToLiters, getConvertMap } from "util/UnitConversion";
import { calculateNominalDiscountRate, makeArray } from "util/Util";
import { Defaults } from "blcc-format/Defaults";

export class E3ObjectService extends Effect.Service<E3ObjectService>()("E3ObjectService", {
    effect: Effect.gen(function* () {
        const db = yield* DexieService;
        const api = yield* BlccApiService;

        const getEmissions = (project: Project) =>
            Effect.gen(function* () {
                const location = project.location as USLocation;
                if (location.zipcode === undefined || location.zipcode.length < 5) return undefined;

                if (project.studyPeriod === undefined) return undefined;

                return yield* api.fetchEmissions(
                    project.releaseYear,
                    location.zipcode,
                    project.studyPeriod,
                    project.case,
                );
            });

        const createE3Object = Effect.gen(function* () {
            const project = yield* db.getProject();

            const emissions = yield* getEmissions(project);

            const builder = new RequestBuilder();

            // Setup base E3 options
            const analysisBuilder = new AnalysisBuilder()
                .type(AnalysisType.LCCA)
                .projectType(ProjectType.OTHER)
                .addOutputType("measure", "optional", "required")
                .studyPeriod(project.studyPeriod ?? 0)
                .timestepValue(TimestepValue.YEAR)
                .timestepComp(
                    project.discountingMethod === DiscountingMethod.END_OF_YEAR
                        ? TimestepComp.END_OF_YEAR
                        : TimestepComp.MID_YEAR,
                )
                .discountRateReal(project.realDiscountRate ?? 0)
                .discountRateNominal(project.nominalDiscountRate ?? 0)
                .inflationRate(project.inflationRate ?? 0)
                .reinvestRate(project.inflationRate ?? 0); //replace with actual reinvest rate

            project.dollarMethod === DollarMethod.CONSTANT ? analysisBuilder.real() : analysisBuilder.nominal();

            // Create costs
            const costs = yield* db.getCosts;
            const costMap = new Map(
                costs.map((cost) => [cost.id, costToBuilders(project, cost, project.studyPeriod ?? 0, emissions)]),
            );

            // Define alternatives
            const alternatives = yield* db.getAlternatives;
            const alternativeBuilders = alternatives.map((alternative) => {
                const builder = new AlternativeBuilder()
                    .name(alternative.name)
                    .addBcn(
                        ...alternative.costs
                            .flatMap((id) => costMap.get(id))
                            .filter((x): x is BcnBuilder => x !== undefined),
                    );

                if (alternative.id) builder.id(alternative.id);
                if (alternative.baseline) return builder.baseline();

                return builder;
            });

            const hasBaseline = !!alternatives.find((alt) => alt.baseline);
            if (!hasBaseline && alternativeBuilders[0]) alternativeBuilders[0].baseline();

            // Create complete Request Builder and return
            return builder.analysis(analysisBuilder).addAlternative(...alternativeBuilders);
        });

        return {
            request: createE3Object.pipe(Effect.andThen(api.fetchE3Request)),
            createE3Object,
        };
    }),
    dependencies: [DexieService.Default, BlccApiService.Default],
}) {}

function costToBuilders(
    project: Project,
    cost: Cost,
    studyPeriod: number,
    emissions: readonly number[] | undefined,
): BcnBuilder[] {
    return Match.type<Cost>().pipe(
        Match.when({ type: CostTypes.CAPITAL }, (cost) => capitalCostToBuilder(cost, studyPeriod)),
        Match.when({ type: CostTypes.ENERGY }, (cost) => energyCostToBuilder(project, cost, emissions)),
        Match.when({ type: CostTypes.WATER }, (cost) => waterCostToBuilder(cost, project)),
        Match.when({ type: CostTypes.REPLACEMENT_CAPITAL }, (cost) =>
            replacementCapitalCostToBuilder(project, cost, studyPeriod),
        ),
        Match.when({ type: CostTypes.OMR }, (cost) => omrCostToBuilder(project, cost)),
        Match.when({ type: CostTypes.IMPLEMENTATION_CONTRACT }, (cost) =>
            implementationContractCostToBuilder(project, cost),
        ),
        Match.when({ type: CostTypes.RECURRING_CONTRACT }, (cost) => recurringContractCostToBuilder(project, cost)),
        Match.when({ type: CostTypes.OTHER }, (cost) => otherCostToBuilder(project, cost)),
        Match.when({ type: CostTypes.OTHER_NON_MONETARY }, (cost) => otherNonMonetaryCostToBuilder(project, cost)),
        Match.exhaustive,
    )(cost);
}

function capitalCostToBuilder(cost: CapitalCost, studyPeriod: number): BcnBuilder[] {
    const tag = "Initial Investment";
    const result = [];

    if (cost.phaseIn) {
        // Create multiple phase in BCNs
        const adjusted = (cost.initialCost ?? 0) * (1 + (cost.costAdjustment ?? 0)) ** cost.phaseIn.length;

        result.push(
            ...cost.phaseIn.map((phaseIn, i) =>
                new BcnBuilder()
                    .type(BcnType.COST)
                    .subType(BcnSubType.DIRECT)
                    .name(`${cost.name} Phase-In year ${i}`)
                    .real()
                    .invest()
                    .initialOccurrence(0)
                    .life(cost.expectedLife ?? -1)
                    .addTag(tag, "LCC")
                    .quantity(cost.costSavings ? -1 : 1)
                    .quantityValue(adjusted * phaseIn),
            ),
        );
    } else {
        // Default BCN
        result.push(
            new BcnBuilder()
                .type(BcnType.COST)
                .subType(BcnSubType.DIRECT)
                .name(cost.name)
                .real()
                .invest()
                .initialOccurrence(0)
                .life(cost.expectedLife ?? -1)
                .addTag(tag, "LCC")
                .quantity(cost.costSavings ? -1 : 1)
                .quantityValue(cost.initialCost ?? 0),
        );
    }

    // Add residual value if there is any
    if (cost.residualValue)
        result.push(
            residualValueBcn(
                cost,
                (cost.initialCost ?? 0) + (cost.amountFinanced ?? 0),
                cost.residualValue,
                studyPeriod,
                cost.annualRateOfChange ?? 0,
            ),
        );

    return result;
}

function energyCostRecurrence(project: Project, cost: EnergyCost) {
    // We are using custom escalation for this cost.
    if (cost.escalation !== undefined) {
        const recurBuilder = new RecurBuilder().interval(1).varRate(VarRate.PERCENT_DELTA);

        if (Array.isArray(cost.escalation)) {
            // Convert array to nominal rates if dollar method is current
            const rates =
                project.dollarMethod === DollarMethod.CURRENT
                    ? cost.escalation.map((rate) =>
                          calculateNominalDiscountRate(rate, project.inflationRate ?? Defaults.INFLATION_RATE),
                      )
                    : cost.escalation;

            // Add 0 for the initial year, so year 1 is the first year of the analysis
            recurBuilder.varValue([0, ...rates]);
        } else {
            // Convert single rate to nominal if dollar method is current
            const rate =
                project.dollarMethod === DollarMethod.CURRENT
                    ? calculateNominalDiscountRate(cost.escalation, project.inflationRate ?? Defaults.INFLATION_RATE)
                    : cost.escalation;

            // Add 0 for the initial year, so year 1 is the first year of the analysis
            recurBuilder.varValue([0, ...makeArray(project.studyPeriod ?? 0, rate)]);
        }

        return recurBuilder;
    }

    // We are not using custom escalation but project escalation rates exist.
    if (project.projectEscalationRates !== undefined) {
        // Get project escalation rates
        const escalation = project.projectEscalationRates
            .filter((rate) => rate.sector === cost.customerSector)
            .map((rate) =>
                Match.value(cost.fuelType).pipe(
                    Match.when(FuelType.ELECTRICITY, () => rate.electricity),
                    Match.when(FuelType.PROPANE, () => rate.propane),
                    Match.when(FuelType.NATURAL_GAS, () => rate.naturalGas),
                    Match.when(FuelType.COAL, () => rate.coal),
                    Match.when(FuelType.DISTILLATE_OIL, () => rate.distillateFuelOil),
                    Match.when(FuelType.RESIDUAL_OIL, () => rate.residualFuelOil),
                    Match.orElse(() => 0),
                ),
            ) as number[];

        // Add 0 for the initial year, so year 1 is the first year of the analysis
        return new RecurBuilder()
            .interval(1)
            .varRate(VarRate.PERCENT_DELTA)
            .varValue([0, ...escalation]);
    }

    // There are no custom escalation nor project escalation rates.
    return recurrence(cost, VarRate.YEAR_BY_YEAR);
}

function energyCostToBuilder(
    project: Project,
    cost: EnergyCost,
    emissions: readonly number[] | undefined,
): BcnBuilder[] {
    const result = [];

    const initial = project.constructionPeriod + 1;

    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Energy", cost.fuelType, cost.unit, "LCC")
        .real()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .initialOccurrence(initial)
        .recur(energyCostRecurrence(project, cost))
        .quantityValue(cost.costPerUnit)
        .quantity(cost.costSavings ? -cost.annualConsumption : cost.annualConsumption)
        .quantityUnit(cost.unit ?? "");

    result.push(builder);

    if (cost.demandCharge !== undefined) {
        result.push(
            new BcnBuilder()
                .name(`${cost.name} Demand Charge`)
                .addTag("Demand Charge", "LCC")
                .real()
                .type(BcnType.COST)
                .subType(BcnSubType.DIRECT)
                .initialOccurrence(initial)
                .recur(energyCostRecurrence(project, cost))
                .quantityValue(cost.demandCharge)
                .quantity(1),
        );
    }

    if (cost.rebate !== undefined) {
        result.push(
            new BcnBuilder()
                .name(`${cost.name} Rebate`)
                .addTag("Rebate", "LCC")
                .real()
                .type(BcnType.BENEFIT)
                .recur(energyCostRecurrence(project, cost))
                .subType(BcnSubType.DIRECT)
                .initialOccurrence(initial)
                .quantityValue(-cost.rebate)
                .quantity(1),
        );
    }

    if (cost.useIndex) {
        // FIXME
        const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
        builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
    }

    if (cost.customerSector) builder.addTag(cost.customerSector);

    // Emissions
    // Convert cost value to correct emissions unit. Usually MJ, but can also be MWh for electricity.
    const convertedUnit = getConvertMap(cost.fuelType)[cost.unit]?.(cost.annualConsumption);

    // If unit conversion failed or we have no emissions data, return
    if (convertedUnit === undefined || emissions === undefined) return result;

    const emissionValues =
        cost.emissions === undefined
            ? emissions.map((value) => value * convertedUnit)
            : cost.emissions.map((value) => value * convertedUnit);

    if (emissionValues.length > 0) {
        result.push(
            new BcnBuilder()
                .name(`${cost.name} Emissions`)
                .addTag("Emissions", `${cost.fuelType} Emissions`, "kg CO2e")
                .real()
                .type(BcnType.NON_MONETARY)
                .initialOccurrence(initial)
                .quantity(1)
                .quantityValue(1)
                .quantityVarRate(VarRate.YEAR_BY_YEAR)
                .quantityVarValue(emissionValues)
                .quantityUnit("kg CO2e"),
        );
    }

    return result;
}

function recurrence(cost: EnergyCost | WaterCost, varRate: VarRate): RecurBuilder {
    const builder = new RecurBuilder().interval(1);

    if (cost.escalation)
        builder.varRate(varRate).varValue(Array.isArray(cost.escalation) ? cost.escalation : [cost.escalation]);

    return builder;
}

function waterCostToBuilder(cost: WaterCost, project: Project): BcnBuilder[] {
    const recurBuilder = recurrence(cost, VarRate.PERCENT_DELTA);

    return [
        ...cost.usage.map((usage) => {
            const builder = new BcnBuilder()
                .type(BcnType.COST)
                .name(cost.name)
                .addTag(cost.unit, "LCC", "Usage", "Water")
                .real()
                .invest()
                .recur(recurBuilder)
                .initialOccurrence(project.constructionPeriod + 1)
                .quantity(
                    cost.costSavings
                        ? -convertToLiters(usage.amount, cost.unit)
                        : convertToLiters(usage.amount, cost.unit),
                )
                .quantityValue(convertCostPerUnitToLiters(usage.costPerUnit, cost.unit))
                .quantityUnit(LiquidUnit.LITER);

            if (cost.useIndex) {
                const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
                builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
            }

            return builder;
        }),
        ...cost.disposal.map((disposal) => {
            const builder = new BcnBuilder()
                .type(BcnType.COST)
                .name(cost.name)
                .addTag(cost.unit, "LCC", "Disposal", "Water")
                .real()
                .invest()
                .recur(recurBuilder)
                .initialOccurrence(project.constructionPeriod + 1)
                .quantity(
                    cost.costSavings
                        ? -convertToLiters(disposal.amount, cost.unit)
                        : convertToLiters(disposal.amount, cost.unit),
                )
                .quantityValue(convertCostPerUnitToLiters(disposal.costPerUnit, cost.unit))
                .quantityUnit(LiquidUnit.LITER);

            if (cost.useIndex) {
                const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
                builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
            }

            return builder;
        }),
    ];
}

function replacementCapitalCostToBuilder(
    project: Project,
    cost: ReplacementCapitalCost,
    studyPeriod: number,
): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag("Replacement Capital", "LCC")
        .life(cost.expectedLife ?? 1)
        .initialOccurrence(cost.initialOccurrence + project.constructionPeriod)
        .quantity(cost.costSavings ? -1 : 1)
        .quantityValue(cost.initialCost ?? -1);

    applyRateOfChangeReplacement(builder, cost, project);

    if (cost.residualValue)
        return [
            builder,
            residualValueBcn(
                cost,
                cost.initialCost ?? -1,
                cost.residualValue,
                studyPeriod,
                cost.annualRateOfChange ?? 0,
            ),
        ];

    return [builder];
}

function omrCostToBuilder(project: Project, cost: OMRCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("OMR", "LCC")
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .initialOccurrence(cost.initialOccurrence + project.constructionPeriod)
        .real()
        .quantityValue(cost.initialCost ?? -1)
        .quantity(cost.costSavings ? -1 : 1);

    if (cost.recurring?.rateOfRecurrence && cost.recurring.rateOfRecurrence > 0) {
        builder.addTag("OMR Recurring");
        applyRateOfChange(builder, cost);
    } else {
        builder.addTag("OMR Non-Recurring");
        applyRateOfChangeNonRecurringOMR(builder, cost, project);
    }

    return [builder];
}

function implementationContractCostToBuilder(project: Project, cost: ImplementationContractCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag("Implementation Contract Cost", "LCC")
        .real()
        .invest()
        .quantity(cost.costSavings ? -1 : 1)
        .quantityValue(cost.cost ?? -1)
        .initialOccurrence(cost.occurrence + project.constructionPeriod);
    applyRateOfChangeNonRecurringContract(builder, cost, project);
    return [builder];
}

function recurringContractCostToBuilder(project: Project, cost: RecurringContractCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag("Recurring Contract Cost", "LCC")
        .real()
        .invest()
        .recur(new RecurBuilder().interval(cost.recurring?.rateOfRecurrence ?? 1))
        .initialOccurrence(cost.initialOccurrence + project.constructionPeriod)
        .quantity(cost.costSavings ? -1 : 1)
        .quantityValue(cost.initialCost ?? -1);
    applyRateOfChange(builder, cost);
    return [builder];
}

function otherCostToBuilder(project: Project, cost: OtherCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .initialOccurrence(cost.initialOccurrence + project.constructionPeriod)
        .type(cost.costOrBenefit === CostBenefit.COST ? BcnType.COST : BcnType.BENEFIT)
        .subType(BcnSubType.DIRECT)
        .addTag("Other", "LCC")
        .addTag(...(cost.tags ?? []))
        .addTag(cost.unit ?? "")
        .quantityValue(cost.valuePerUnit)
        .quantity(cost.costOrBenefit ? -cost.numberOfUnits : cost.numberOfUnits)
        .quantityUnit(cost.unit ?? ""); //TODO rate of change

    applyRateOfChange(builder, cost);

    return [builder];
}

function otherNonMonetaryCostToBuilder(project: Project, cost: OtherNonMonetary): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Other Non-Monetary")
        .addTag(cost.unit ?? "")
        .addTag(...(cost.tags ?? []))
        .initialOccurrence(cost.initialOccurrence + project.constructionPeriod)
        .type(BcnType.NON_MONETARY)
        .subType(BcnSubType.DIRECT)
        .quantity(cost.costSavings ? -cost.numberOfUnits : cost.numberOfUnits)
        .quantityValue(1)
        .quantityUnit(cost.unit ?? "");

    applyRateOfChange(builder, cost);

    return [builder];
}

function applyRateOfChangeReplacement(builder: BcnBuilder, cost: ReplacementCapitalCost, project: Project) {
    const recurBuilder = new RecurBuilder().interval(50).end(cost.initialOccurrence + project.constructionPeriod + 1);

    if (cost.annualRateOfChange !== undefined) {
        recurBuilder.varRate(VarRate.PERCENT_DELTA).varValue([cost.annualRateOfChange]);
    }
    builder.recur(recurBuilder);
}

function applyRateOfChangeNonRecurringContract(
    builder: BcnBuilder,
    cost: ImplementationContractCost,
    project: Project,
) {
    const recurBuilder = new RecurBuilder().interval(50);
    recurBuilder.end(cost.occurrence + project.constructionPeriod);

    if (cost.valueRateOfChange !== undefined) {
        recurBuilder.varRate(VarRate.PERCENT_DELTA).varValue([cost.valueRateOfChange]);
    }
    builder.recur(recurBuilder);
}

function applyRateOfChangeNonRecurringOMR(builder: BcnBuilder, cost: OMRCost, project: Project) {
    const recurBuilder = new RecurBuilder().interval(50);
    recurBuilder.end(cost.initialOccurrence + project.constructionPeriod);

    if (cost.recurring?.rateOfChangeValue !== undefined) {
        recurBuilder
            .varRate(VarRate.PERCENT_DELTA)
            .varValue(
                Array.isArray(cost.recurring.rateOfChangeValue)
                    ? cost.recurring.rateOfChangeValue
                    : [cost.recurring.rateOfChangeValue],
            );
    }
    builder.recur(recurBuilder);
}

function applyRateOfChange(builder: BcnBuilder, cost: OtherCost | OtherNonMonetary | RecurringContractCost | OMRCost) {
    if (cost.recurring?.rateOfChangeUnits)
        builder
            .quantityVarRate(VarRate.YEAR_BY_YEAR)
            .quantityVarValue(
                Array.isArray(cost.recurring.rateOfChangeUnits)
                    ? cost.recurring.rateOfChangeUnits
                    : [cost.recurring.rateOfChangeUnits],
            );

    if (cost.recurring) {
        const recurBuilder = new RecurBuilder().interval(cost.recurring.rateOfRecurrence ?? 1);

        if (cost.recurring.rateOfChangeValue !== undefined) {
            recurBuilder
                .varRate(VarRate.PERCENT_DELTA)
                .varValue(
                    Array.isArray(cost.recurring.rateOfChangeValue)
                        ? cost.recurring.rateOfChangeValue
                        : [cost.recurring.rateOfChangeValue],
                );
        }

        builder.recur(recurBuilder);
    }
}

function residualValueBcn(
    cost: Cost,
    value: number,
    obj: ResidualValue,
    studyPeriod: number,
    rateOfChange: number,
    tags: string[] = [],
): BcnBuilder {
    return new BcnBuilder()
        .name(`${cost.name} Residual Value`)
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag(...tags)
        .addTag("LCC", "Residual Value")
        .real()
        .initialOccurrence(studyPeriod)
        .quantity(1)
        .quantityValue(
            obj.approach === DollarOrPercent.PERCENT
                ? value * (1 + rateOfChange) ** studyPeriod * -obj.value
                : -obj.value,
        );
}
