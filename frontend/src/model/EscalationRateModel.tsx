import { bind } from "@react-rxjs/core";
import { type Cost, DollarMethod } from "blcc-format/Format";
import { Effect } from "effect";
import { CostModel } from "model/CostModel";
import { isEnergyCost } from "model/Guards";
import { Model } from "model/Model";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import * as O from "optics-ts";
import type { RenderCellProps, RenderEditCellProps } from "react-data-grid";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { combineLatestWith, filter, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { BlccApiService } from "services/BlccApiService";
import { guard } from "util/Operators";
import {
    calculateNominalDiscountRate,
    calculateRealDiscountRate,
    fuelTypeToRate,
    makeArray,
    percentFormatter,
    toDecimal,
    toPercentage,
} from "util/Util";
import { BlccRuntime } from "util/runtime";
import { Var } from "util/var";
import { Defaults } from "blcc-format/Defaults";

export const DEFAULT_CONSTANT_ESCALATION_RATE = 0;

export type EscalationRateInfo = {
    year: number;
    rate: number;
};

export function toEscalationRateInfo([rates, releaseYear]: [number[], number]): EscalationRateInfo[] {
    return rates.map((rate, i) => ({
        year: releaseYear + i,
        rate,
    }));
}

export namespace EscalationRateModel {
    export const COLUMNS = [
        {
            name: "Year",
            key: "year",
        },
        {
            name: "Escalation Rate (%)",
            key: "rate",
            renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<EscalationRateInfo>) => {
                // If the dollar method is current, convert back to real rate to store.
                const dollarMethod = Model.dollarMethod.use();
                const inflationRate = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;

                return (
                    <>
                        <input
                            className={"w-full pl-4"}
                            type={"number"}
                            defaultValue={
                                dollarMethod === DollarMethod.CONSTANT
                                    ? toPercentage(row.rate) // Real rate
                                    : toPercentage(calculateNominalDiscountRate(row.rate, inflationRate)) // Nominal rate
                            }
                            onChange={(event) => {
                                const value = toDecimal(event.currentTarget.value);

                                onRowChange({
                                    ...row,
                                    [column.key]:
                                        dollarMethod === DollarMethod.CONSTANT
                                            ? value // Real rate
                                            : calculateRealDiscountRate(value, inflationRate), // Nominal rate
                                });
                            }}
                            ref={(input) => input?.focus()}
                        />
                    </>
                );
            },
            editable: true,
            renderCell: (info: RenderCellProps<EscalationRateInfo>) => {
                // If the dollar method is current, display nominal rate from stored real rate.
                const dollarMethod = Model.dollarMethod.use();
                const inflationRate = Model.inflationRate.use() ?? Defaults.INFLATION_RATE;

                return percentFormatter.format(
                    dollarMethod === DollarMethod.CONSTANT
                        ? info.row.rate // Real rate
                        : calculateNominalDiscountRate(info.row.rate, inflationRate), // Nominal rate
                );
            },
        },
    ];

    const escalationOptic = O.optic<Cost>().guard(isEnergyCost);

    export const escalation = new Var(CostModel.cost, escalationOptic.prop("escalation"));
    export const [useConstantEscalationRatePercentage] = bind(
        escalation.$.pipe(
            filter((escalation): escalation is number => escalation !== undefined && !Array.isArray(escalation)),
            withLatestFrom(Model.dollarMethod.$, Model.inflationRate.$),
            map(([escalation, dollarMethod, inflationRate]) =>
                // Convert to nominal rate if needed
                dollarMethod === DollarMethod.CURRENT
                    ? calculateNominalDiscountRate(escalation, inflationRate ?? Defaults.INFLATION_RATE)
                    : escalation,
            ),
            map(toPercentage),
        ),
    );

    export const customEscalation = new Var(CostModel.cost, escalationOptic.prop("customEscalation"));

    export const [isConstant] = bind(
        escalation.$.pipe(map((escalation) => escalation !== undefined && !Array.isArray(escalation))),
    );

    export const [isProjectRatesValid] = bind(
        Model.projectEscalationRates.$.pipe(map((rates) => Array.isArray(rates))),
    );

    export const [isUsingCustomEscalationRates] = bind(customEscalation.$.pipe(map((bool) => bool ?? false)), false);

    export const [isProjectZipValid] = bind(
        Model.Location.zipcode.$.pipe(map((zip) => zip !== undefined && zip !== "" && zip.length === 5)),
        false,
    );

    export const [isSectorValid] = bind(
        EnergyCostModel.customerSector.$.pipe(map((sector) => sector !== undefined)),
        false,
    );

    /*
     * The grid values for when the user is using custom escalation rates.
     */
    export const [useCustomEscalationGridValues] = bind(
        escalation.$.pipe(
            filter((escalation): escalation is number[] => escalation !== undefined && Array.isArray(escalation)),
            combineLatestWith(Model.releaseYear.$),
            map(toEscalationRateInfo),
        ),
        [],
    );

    export const [useNonUSLocationGridValues] = bind(
        combineLatest([Model.releaseYear.$, Model.studyPeriod.$, Model.eiaCase.$]).pipe(
            switchMap(([releaseYear, studyPeriod, eiaCase]) =>
                BlccRuntime.runPromise(
                    Effect.gen(function* () {
                        const api = yield* BlccApiService;

                        yield* Effect.log(
                            "Fetching custom non us location escalation rates",
                            releaseYear,
                            studyPeriod,
                            eiaCase,
                        );
                        return yield* Effect.orElse(
                            api.fetchEscalationRates(
                                releaseYear,
                                releaseYear,
                                releaseYear + (studyPeriod ?? 0),
                                eiaCase,
                            ),
                            () =>
                                Effect.andThen(
                                    Effect.log("Failed to fetch escalation rates, defaulting to undefined"),
                                    Effect.succeed(undefined),
                                ),
                        );
                    }),
                ),
            ),
            guard(),
            combineLatestWith(EnergyCostModel.customerSector.$, EnergyCostModel.fuelType.$),
            map(([rates, sector, fuelType]) => {
                const escalation = rates
                    .filter((rate) => rate.sector === sector)
                    .map((rate) => fuelTypeToRate(rate, fuelType) ?? 0);

                if (escalation === null) return [] as number[];

                return escalation as number[];
            }),
            guard(),
            tap((rates) => escalation.set(rates)),
            combineLatestWith(Model.releaseYear.$),
            map(toEscalationRateInfo),
        ),
    );

    export const [useCustomZipGridValues] = bind(
        combineLatest([
            Model.releaseYear.$,
            Model.studyPeriod.$,
            EnergyCostModel.Location.model.zipcode.$,
            Model.eiaCase.$,
        ]).pipe(
            distinctUntilChanged(),
            // Make sure the zipcode exists and is 5 digits
            filter((values) => values[2] !== undefined && values[2].length === 5),
            switchMap(([releaseYear, studyPeriod, zipcode, eiaCase]) =>
                BlccRuntime.runPromise(
                    Effect.gen(function* () {
                        const api = yield* BlccApiService;

                        yield* Effect.log(
                            "Fetching custom location escalation rates",
                            releaseYear,
                            studyPeriod,
                            zipcode,
                            eiaCase,
                        );
                        return yield* Effect.orElse(
                            api.fetchEscalationRates(
                                releaseYear,
                                releaseYear,
                                releaseYear + (studyPeriod ?? 0) - 1, // The study period includes the start year, so subtract 1
                                eiaCase,
                                zipcode ? Number.parseInt(zipcode) : undefined,
                            ),
                            () =>
                                Effect.andThen(
                                    Effect.log("Failed to fetch escalation rates, defaulting to undefined"),
                                    Effect.succeed(undefined),
                                ),
                        );
                    }),
                ),
            ),
            guard(),
            combineLatestWith(EnergyCostModel.customerSector.$, EnergyCostModel.fuelType.$),
            map(([rates, sector, fuelType]) => {
                const escalation = rates
                    .filter((rate) => rate.sector === sector)
                    .map((rate) => fuelTypeToRate(rate, fuelType) ?? 0);

                if (escalation === null) return [] as number[];

                return escalation as number[];
            }),
            guard(),
            tap((rates) => escalation.set(rates)),
            combineLatestWith(Model.releaseYear.$),
            map(toEscalationRateInfo),
        ),
        [],
    );

    export const [useProjectRatesGridValues] = bind(
        Model.projectEscalationRates.$.pipe(
            guard(),
            combineLatestWith(EnergyCostModel.customerSector.$, EnergyCostModel.fuelType.$),
            map(([rates, sector, fuelType]) => {
                const escalation = rates
                    .filter((rate) => rate.sector === sector)
                    .map((rate) => fuelTypeToRate(rate, fuelType) ?? 0);

                if (escalation === null) return [] as number[];

                return escalation as number[];
            }),
            guard(),
            combineLatestWith(Model.releaseYear.$),
            map(toEscalationRateInfo),
        ),
        [],
    );

    export namespace Actions {
        export function toggleConstant(toggle: boolean) {
            if (toggle) {
                // Is constant
                const rates = escalation.current();
                escalation.set((rates as number[])[0] ?? DEFAULT_CONSTANT_ESCALATION_RATE);
                customEscalation.set(false);
            } else {
                // Not constant
                const val = escalation.current();
                if (val === undefined || Array.isArray(val) || val === DEFAULT_CONSTANT_ESCALATION_RATE) {
                    customEscalation.set(false);
                    escalation.set(undefined);
                } else {
                    const projectLength =
                        (Model.constructionPeriod.current() ?? 0) + (Model.studyPeriod.current() ?? 0) + 1;
                    customEscalation.set(true);
                    escalation.set(makeArray(projectLength, val));
                }
            }
        }

        export function setConstant(value: number | null) {
            if (value === null) return;

            // Convert back to real if necessary
            if (Model.dollarMethod.current() === DollarMethod.CURRENT) {
                escalation.set(
                    calculateRealDiscountRate(
                        toDecimal(value),
                        Model.inflationRate.current() ?? Defaults.INFLATION_RATE,
                    ),
                );
            } else {
                escalation.set(toDecimal(value));
            }
        }

        export function setRates(rates: EscalationRateInfo[]) {
            const newRates = rates.map((rate) => rate.rate);

            escalation.set(newRates);
            customEscalation.set(true);
        }

        export function resetToDefault() {
            customEscalation.set(false);
            escalation.set(undefined);
        }
    }
}
