import { bind } from "@react-rxjs/core";
import { type Cost, FuelType } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isEscalationCost } from "model/Guards";
import { Model, Var } from "model/Model";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import * as O from "optics-ts";
import { combineLatest, iif, map } from "rxjs";
import { combineLatestWith, filter, switchMap } from "rxjs/operators";
import { match } from "ts-pattern";
import { guard } from "util/Operators";

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

    export const [areProjectRatesValid] = bind(
        Model.projectEscalationRates.$.pipe(map((rates) => Array.isArray(rates))),
    );

    export const [isUsingCustomEscalationRates] = bind(customEscalation.$.pipe(map((bool) => bool ?? false)));

    const values$ = combineLatest([escalation.$, customEscalation.$]).pipe(
        switchMap(([customRates, isUsingCustomRates]) =>
            iif(
                () => !(isUsingCustomRates ?? false) || customRates === undefined,
                Model.projectEscalationRates.$.pipe(
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
                ),
                escalation.$.pipe(filter<number | number[] | undefined, number[]>(Array.isArray)),
            ),
        ),
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
