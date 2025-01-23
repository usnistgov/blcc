import { bind } from "@react-rxjs/core";
import type { Cost } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isEscalationCost } from "model/Guards";
import { Model, Var } from "model/Model";
import * as O from "optics-ts";
import { map } from "rxjs";

export namespace EscalationRateModel {
    const escalationOptic = O.optic<Cost>().guard(isEscalationCost);

    export const escalation = new Var(CostModel.cost, escalationOptic.prop("escalation"));

    export const customEscalation = new Var(CostModel.cost, escalationOptic.prop("customEscalation"));

    export const [isConstant, isConstant$] = bind(escalation.$.pipe(map((escalation) => !Array.isArray(escalation))));

    export const [areProjectRatesValid] = bind(
        Model.projectEscalationRates.$.pipe(map((rates) => Array.isArray(rates))),
    );

    export namespace Actions {
        export function toggleConstant(toggle: boolean) {
            if (toggle) {
                // Is constant
                escalation.set(0);
            } else {
                // Not constant
                //TODO: need to get default values
                escalation.set([]);
            }
        }

        export function setConstant(value: number | null) {
            if (value !== null) escalation.set(value);
        }
    }
}
