import { bind } from "@react-rxjs/core";
import { type Cost, FuelType } from "blcc-format/Format";
import { fetchEscalationRates } from "blcc-format/api";
import { Effect } from "effect";
import { CostModel } from "model/CostModel";
import { isEscalationCost } from "model/Guards";
import { Location, Model, Var, eiaCase, projectEscalationRates, releaseYear, studyPeriod } from "model/Model";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import * as O from "optics-ts";
import { combineLatest, distinctUntilChanged, iif, map, of } from "rxjs";
import { combineLatestWith, filter, switchMap } from "rxjs/operators";
import { match } from "ts-pattern";
import { gate, guard } from "util/Operators";

export type EscalationRateInfo = {
    year: number;
    rate: number;
};

function toEscalationRateInfo([rates, releaseYear]: [number[], number]): EscalationRateInfo[] {
    return rates.map((rate, i) => ({
        year: releaseYear + i,
        rate,
    }));
}

export namespace EscalationRateModel {
    const escalationOptic = O.optic<Cost>().guard(isEscalationCost);

    export const escalation = new Var(CostModel.cost, escalationOptic.prop("escalation"));

    export const customEscalation = new Var(CostModel.cost, escalationOptic.prop("customEscalation"));

    export const [isConstant] = bind(
        escalation.$.pipe(map((escalation) => escalation !== undefined && !Array.isArray(escalation))),
    );

    export const [isProjectRatesValid, isProjectRatesValid$] = bind(
        Model.projectEscalationRates.$.pipe(map((rates) => Array.isArray(rates))),
    );

    export const [isUsingCustomEscalationRates, isUsingCustomEscalationRates$] = bind(
        customEscalation.$.pipe(map((bool) => bool ?? false)),
    );

    export const [isSectorValid, isSectorValid$] = bind(
        EnergyCostModel.customerSector.$.pipe(map((sector) => sector !== undefined)),
    );

    export const [showGrid] = bind(
        combineLatest([
            isProjectRatesValid$,
            isSectorValid$,
            isUsingCustomEscalationRates$,
            EnergyCostModel.Location.isZipValid$,
            EnergyCostModel.Location.isUsingCustomLocation$,
        ]).pipe(
            map(
                ([
                    isProjectRatesValid,
                    isSectorValid,
                    isUsingCustomEscalationRates,
                    isCustomZipValid,
                    isUsingCustomLocation,
                ]) =>
                    isUsingCustomEscalationRates ||
                    (isUsingCustomLocation && isCustomZipValid && isSectorValid) ||
                    (!isUsingCustomLocation && isProjectRatesValid && isSectorValid),
            ),
        ),
    );

    const useCustomLocationRates$ = combineLatest([
        customEscalation.$,
        EnergyCostModel.Location.isUsingCustomLocation$,
    ]).pipe(map(([customEscalation, usingCustomLocation]) => !customEscalation && usingCustomLocation));

    export const setCustomZipRates$ = combineLatest([
        Model.releaseYear.$,
        Model.studyPeriod.$,
        EnergyCostModel.Location.model.zipcode.$,
        Model.eiaCase.$,
    ]).pipe(
        gate(useCustomLocationRates$),
        distinctUntilChanged(),
        // Make sure the zipcode exists and is 5 digits
        filter((values) => values[2] !== undefined && values[2].length === 5),
        switchMap(([releaseYear, studyPeriod, zipcode, eiaCase]) =>
            Effect.runPromise(
                Effect.gen(function* () {
                    yield* Effect.log(
                        "Fetching custom location escalation rates",
                        releaseYear,
                        studyPeriod,
                        zipcode,
                        eiaCase,
                    );
                    return yield* Effect.orElse(
                        fetchEscalationRates(
                            releaseYear,
                            releaseYear,
                            releaseYear + (studyPeriod ?? 0),
                            Number.parseInt(zipcode ?? "0"),
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
                .map((rate) =>
                    match(fuelType)
                        .with(FuelType.ELECTRICITY, () => rate.electricity)
                        .with(FuelType.PROPANE, () => rate.propane)
                        .with(FuelType.NATURAL_GAS, () => rate.naturalGas)
                        .with(FuelType.COAL, () => rate.coal)
                        .with(FuelType.DISTILLATE_OIL, () => rate.distillateFuelOil)
                        .with(FuelType.RESIDUAL_OIL, () => rate.residualFuelOil)
                        .otherwise(() => 0),
                );

            if (escalation === null) return [] as number[];

            return escalation as number[];
        }),
        guard(),
    );

    const values$ = combineLatest([
        escalation.$,
        customEscalation.$,
        EnergyCostModel.Location.isUsingCustomLocation$,
    ]).pipe(
        switchMap(([customRates, isUsingCustomRates, isUsingCustomLocation]) => {
            // If we are using custom rates, use them. This overrides the project or local escalation rates
            if (isUsingCustomRates || isUsingCustomLocation) {
                return escalation.$.pipe(filter<number | number[] | undefined, number[]>(Array.isArray));
            }

            // We are not using custom rates, and do not have a custom location, so use the project rates.
            return Model.projectEscalationRates.$.pipe(
                guard(),
                combineLatestWith(EnergyCostModel.customerSector.$, EnergyCostModel.fuelType.$),
                map(([rates, sector, fuelType]) => {
                    const escalation = rates
                        .filter((rate) => rate.sector === sector)
                        .map((rate) =>
                            match(fuelType)
                                .with(FuelType.ELECTRICITY, () => rate.electricity)
                                .with(FuelType.PROPANE, () => rate.propane)
                                .with(FuelType.NATURAL_GAS, () => rate.naturalGas)
                                .with(FuelType.COAL, () => rate.coal)
                                .with(FuelType.DISTILLATE_OIL, () => rate.distillateFuelOil)
                                .with(FuelType.RESIDUAL_OIL, () => rate.residualFuelOil)
                                .otherwise(() => 0),
                        );

                    if (escalation === null) return [] as number[];

                    return escalation as number[];
                }),
                guard(),
            );
        }),
    );

    export const [gridValues] = bind(values$.pipe(combineLatestWith(Model.releaseYear.$), map(toEscalationRateInfo)));

    export namespace Actions {
        export function toggleConstant(toggle: boolean) {
            if (toggle) {
                // Is constant
                escalation.set(0);
                customEscalation.set(false);
            } else {
                // Not constant
                escalation.set(undefined);
                customEscalation.set(false);
            }
        }

        export function setConstant(value: number | null) {
            if (value !== null) escalation.set(value);
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
