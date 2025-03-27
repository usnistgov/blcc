import { mdiCheck, mdiClose } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Modal } from "antd";
import { Defaults } from "blcc-format/Defaults";
import { AnalysisType, DiscountingMethod, DollarMethod, Purpose } from "blcc-format/Format";
import type { DiscountRatesResponse } from "blcc-format/schema";
import { Button, ButtonType } from "components/input/Button";
import { Effect, Match } from "effect";
import { Model } from "model/Model";
import { type OperatorFunction, map, merge, pipe, switchMap, take, tap } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
import { BlccApiService } from "services/BlccApiService";
import { calculateNominalDiscountRate, calculateRealDiscountRate, closest } from "util/Util";
import { BlccRuntime } from "util/runtime";

export function showUpdateGeneralOptionsModal(): OperatorFunction<unknown, void> {
    return pipe(
        switchMap(() => {
            UpdateGeneralOptionsModel.open();

            return merge(
                UpdateGeneralOptionsModel.cancel$,
                UpdateGeneralOptionsModel.update$.pipe(
                    withLatestFrom(Model.analysisType.$, Model.purpose.$, Model.releaseYear.$, Model.studyPeriod.$),
                    tap(([, analysisType, purpose, releaseYear, studyPeriod]) =>
                        setVariables(
                            analysisType ?? AnalysisType.FEDERAL_FINANCED,
                            purpose,
                            releaseYear,
                            studyPeriod ?? Defaults.STUDY_PERIOD,
                        ),
                    ),
                ),
            ).pipe(take(1));
        }),
        map(() => void 0),
    );
}

export namespace UpdateGeneralOptionsModel {
    export const [update$, update] = createSignal();
    export const [cancel$, cancel] = createSignal();
    export const [open$, open] = createSignal();
    export const [useOpen] = bind(
        merge(merge(cancel$, update$).pipe(map(() => false)), open$.pipe(map(() => true))),
        false,
    );
}

export default function UpdateGeneralOptionsModal() {
    return (
        <Modal
            title={"Update General Information"}
            closable={false}
            onCancel={UpdateGeneralOptionsModel.cancel}
            open={UpdateGeneralOptionsModel.useOpen()}
            footer={
                <div className={"mt-8 flex w-full flex-row justify-end gap-4"}>
                    <Button type={ButtonType.ERROR} icon={mdiClose} onClick={UpdateGeneralOptionsModel.cancel}>
                        Don't Update
                    </Button>
                    <Button type={ButtonType.PRIMARY} icon={mdiCheck} onClick={UpdateGeneralOptionsModel.update}>
                        Update
                    </Button>
                </div>
            }
        >
            <div className={"mt-8 flex flex-col items-center gap-4"}>
                <p className={"w-80 text-justify"}>
                    Changing the <b>Analysis Type</b>, <b>Data Release Year</b>, or the <b>Project Purpose</b> may also
                    update the <b>Dollar Analysis</b>, <b>Discounting Convention</b>, and <b>Discount Rates</b>.
                </p>
                <p className={"w-80 text-justify"}>Do you wish to keep those values the same or update to default?</p>
            </div>
        </Modal>
    );
}

function setFederalFinanced(rates: readonly DiscountRatesResponse[]) {
    const nominal = rates[0].nominal;
    const inflation = rates[0].inflation;
    const real = calculateRealDiscountRate(nominal, inflation);

    Model.purpose.set(undefined);
    Model.dollarMethod.set(DollarMethod.CURRENT);
    Model.discountingMethod.set(DiscountingMethod.END_OF_YEAR);
    Model.realDiscountRate.set(real);
    Model.nominalDiscountRate.set(nominal);
    Model.inflationRate.set(inflation);
}

function setFempEnergy(rates: readonly DiscountRatesResponse[]) {
    const inflation = rates[0].inflation;
    const real = rates[0].real;
    const nominal = calculateNominalDiscountRate(real, inflation);

    Model.purpose.set(undefined);
    Model.dollarMethod.set(DollarMethod.CONSTANT);
    Model.discountingMethod.set(DiscountingMethod.END_OF_YEAR);
    Model.realDiscountRate.set(real);
    Model.nominalDiscountRate.set(nominal);
    Model.inflationRate.set(inflation);
}

function setOmbNonEnergy(
    rates: readonly DiscountRatesResponse[],
    purpose: Purpose | undefined,
    studyPeriod: number | undefined,
) {
    const rate = closest(rates, (rate) => rate.year, studyPeriod ?? 3);

    Model.dollarMethod.set(DollarMethod.CONSTANT);
    Model.discountingMethod.set(DiscountingMethod.END_OF_YEAR);
    Model.inflationRate.set(rate.inflation);

    if (purpose === Purpose.INVEST_REGULATION) {
        const real = 0.07; // This is set to a fixed value of 7% on purpose.
        Model.realDiscountRate.set(real);
        Model.nominalDiscountRate.set(calculateNominalDiscountRate(real, rate.inflation));
    } else {
        Model.realDiscountRate.set(rate.real);
        Model.nominalDiscountRate.set(calculateNominalDiscountRate(rate.real, rate.inflation));
    }
}

function setMilconEnergyAndEcip(rates: readonly DiscountRatesResponse[]) {
    const real = rates[0].real;
    const inflation = rates[0].inflation;
    const nominal = calculateNominalDiscountRate(real, inflation);

    Model.purpose.set(undefined);
    Model.dollarMethod.set(DollarMethod.CONSTANT);
    Model.discountingMethod.set(DiscountingMethod.MID_YEAR);
    Model.realDiscountRate.set(real);
    Model.nominalDiscountRate.set(nominal);
    Model.inflationRate.set(inflation);
}

function setMilconNonEnergy(rates: readonly DiscountRatesResponse[], studyPeriod: number | undefined) {
    const rate = closest(rates, (rate) => rate.year, studyPeriod ?? 3);

    Model.purpose.set(undefined);
    Model.dollarMethod.set(DollarMethod.CONSTANT);
    Model.discountingMethod.set(DiscountingMethod.MID_YEAR);
    Model.realDiscountRate.set(rate.real);
    Model.nominalDiscountRate.set(calculateNominalDiscountRate(rate.real, rate.inflation));
    Model.inflationRate.set(rate.inflation);
}

function setVariables(
    analysisType: AnalysisType,
    purpose: Purpose | undefined,
    releaseYear: number,
    studyPeriod: number,
) {
    BlccRuntime.runPromise(
        Effect.gen(function* () {
            // Fetch the discount rates
            const api = yield* BlccApiService;
            const [doeDiscountRates, ombDiscountRates] = yield* Effect.all(
                [api.fetchDoeDiscountRates(releaseYear), api.fetchOmbDiscountRates(releaseYear)],
                { concurrency: 2 },
            );

            // Set the necessary variables
            Match.value(analysisType).pipe(
                Match.when(AnalysisType.FEDERAL_FINANCED, () => setFederalFinanced(doeDiscountRates)),
                Match.when(AnalysisType.FEMP_ENERGY, () => setFempEnergy(doeDiscountRates)),
                Match.when(AnalysisType.OMB_NON_ENERGY, () => setOmbNonEnergy(ombDiscountRates, purpose, studyPeriod)),
                Match.when(AnalysisType.MILCON_NON_ENERGY, () => setMilconNonEnergy(ombDiscountRates, studyPeriod)),
                Match.whenOr(AnalysisType.MILCON_ENERGY, AnalysisType.MILCON_ECIP, () =>
                    setMilconEnergyAndEcip(doeDiscountRates),
                ),
                Match.exhaustive,
            );
        }),
    );
}
