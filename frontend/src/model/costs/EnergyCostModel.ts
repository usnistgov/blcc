import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import {
    Case,
    type Cost,
    CostTypes,
    CustomerSector,
    EmissionsRateType,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    GhgDataSource,
    type Unit,
} from "blcc-format/Format";
import type { Collection } from "dexie";
import { Match } from "effect";
import { CostModel } from "model/CostModel";
import { isEnergyCost, isNonUSLocation, isUSLocation } from "model/Guards";
import { type LocationModel, Model } from "model/Model";
import * as O from "optics-ts";
import { type Observable, Subject, combineLatest, distinctUntilChanged, map, merge, of, switchMap } from "rxjs";
import { filter, shareReplay, startWith, tap, withLatestFrom } from "rxjs/operators";
import { COAL_KG_CO2E_PER_MEGAJOULE } from "util/UnitConversion";
import { fuelTypeToRate, index, makeApiRequest } from "util/Util";
import { Var } from "util/var";
import z from "zod";
import cost = CostModel.cost;

type ZipInfoResponse = {
    zip: number;
    ba: string;
    gea: string;
    state: string;
    padd: string;
    technobasin: string;
    reeds_ba: string;
};

const EIA_CASE_MAP = {
    [Case.REF]: "REF",
    [Case.LOWZTC]: "lowZTC",
};

const RATE_MAP = {
    [EmissionsRateType.AVERAGE]: "avg",
    [EmissionsRateType.LONG_RUN_MARGINAL]: "lrm",
};

export namespace EnergyCostModel {
    /**
     * Outputs a value if the current cost is an energy cost
     */
    export const cost$ = cost.$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));
    export const energyCostOptic = O.optic<Cost>().guard(isEnergyCost);

    // The location must not be marked as optional since we want to be able to set it to undefined if needed
    const locationOptic = energyCostOptic.prop("location");
    export const location = new Var(CostModel.cost, locationOptic);

    const collection$ = CostModel.collection$ as Observable<Collection<EnergyCost>>;

    // Location override
    export namespace Location {
        export const model: LocationModel<Cost> = {
            country: new Var(CostModel.cost, locationOptic.optional().prop("country")),
            city: new Var(CostModel.cost, locationOptic.optional().prop("city")),
            state: new Var(CostModel.cost, locationOptic.optional().guard(isUSLocation).prop("state")),
            stateProvince: new Var(
                CostModel.cost,
                locationOptic.optional().guard(isNonUSLocation).prop("stateProvince"),
            ),
            zipcode: new Var(
                CostModel.cost,
                locationOptic.optional().guard(isUSLocation).prop("zipcode"),
                z.string().max(5),
            ),
        };

        export const [toggleLocation$, toggleLocation] = createSignal<boolean>();
        toggleLocation$
            .pipe(withLatestFrom(Model.location.$))
            .subscribe(([toggle, projectLocation]) => location.set(toggle ? { ...projectLocation } : undefined));

        /**
         * True if the location property exists, otherwise false.
         * Indicates we are using a custom location for this cost.
         */
        export const [isUsingCustomLocation, isUsingCustomLocation$] = bind(
            location.$.pipe(map((location) => location !== undefined)),
        );

        export const [isZipValid, isZipValid$] = bind(
            model.zipcode.$.pipe(map((zip) => zip !== undefined && zip !== "" && zip.length === 5)),
        );

        /**
         * Returns the global zipcode if location is undefined, otherwise returns the overridden zipcode
         */
        export const globalOrCustomZip$ = location.$.pipe(
            switchMap((location) => (location === undefined ? Model.Location.zipcode.$ : Location.model.zipcode.$)),
            tap((x) => console.log("Global Zip: ", x)),
            distinctUntilChanged(),
            shareLatest(),
        );

        /**
         * The zip info for the global or custom zipcode
         */
        export const zipInfo$ = globalOrCustomZip$.pipe(
            tap((x) => console.log("Custom Zip: ", x)),
            switchMap((zip) => makeApiRequest<ZipInfoResponse[]>("zip_info", { zip: Number.parseInt(zip ?? "0") })),
            map(index(0)),
        );

        export namespace Actions {
            export const toggleLocation = Location.toggleLocation;
        }
    }

    /**
     * Cost per unit
     */
    export const costPerUnit = new Var(CostModel.cost, energyCostOptic.prop("costPerUnit"));

    /**
     * Annual consumption
     */
    export const annualConsumption = new Var(CostModel.cost, energyCostOptic.prop("annualConsumption"));

    /**
     * Rebate
     */
    export const rebate = new Var(CostModel.cost, energyCostOptic.prop("rebate"));

    /**
     * Demand Charge
     */
    export const demandCharge = new Var(CostModel.cost, energyCostOptic.prop("demandCharge"));

    /**
     * Customer sector streams
     */
    export const customerSector = new Var(CostModel.cost, energyCostOptic.prop("customerSector"));

    /**
     * Fuel type streams
     */
    export const fuelType = new Var(CostModel.cost, energyCostOptic.prop("fuelType"));

    export const [sectorOptions] = bind(
        combineLatest([fuelType.$, Model.projectEscalationRates.$]).pipe(
            map(([fuelType, projectEscalationRates]) => {
                if (projectEscalationRates === undefined) {
                    if (fuelType === FuelType.COAL) return [CustomerSector.INDUSTRIAL];

                    return Object.values(CustomerSector);
                }

                // Only return the sectors that have non-null escalation rates
                return Object.values(CustomerSector).filter((sector) => {
                    const first = projectEscalationRates.find((rates) => rates.sector === sector);
                    return first !== undefined && fuelTypeToRate(first, fuelType) !== null;
                });
            }),
            withLatestFrom(customerSector.$),
            tap(([options, currentSector]) => {
                if (currentSector !== undefined && !options.includes(currentSector)) customerSector.set(undefined);
            }),
            map(([options]) => options),
            startWith(Object.values(CustomerSector)),
        ),
    );

    /**
     * Unit streams
     */
    export const sUnitChange$ = new Subject<Unit>();
    export const unit$ = merge(sUnitChange$, cost$.pipe(map((cost) => cost.unit))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    export const [useUnit] = bind(unit$, EnergyUnit.KWH);
    sUnitChange$
        .pipe(withLatestFrom(collection$))
        .subscribe(([unit, costCollection]) => costCollection.modify({ unit }));

    export namespace Emissions {
        export const emissions$: Observable<number[] | undefined> = combineLatest([
            Location.zipInfo$,
            Model.releaseYear.$,
            Model.studyPeriod.$,
            Model.eiaCase.$,
            Model.emissionsRateType.$,
            Model.ghgDataSource.$,
            fuelType.$,
        ]).pipe(
            switchMap(([zipInfo, releaseYear, studyPeriod, eiaCase, rate, ghgDataSource, fuelType]) =>
                getEmissions(zipInfo, releaseYear, studyPeriod, eiaCase, rate, ghgDataSource, fuelType),
            ),
        );
        emissions$.pipe(withLatestFrom(collection$)).subscribe(([emissions, collection]) => {
            if (emissions === undefined) {
                collection.modify({
                    emissions: undefined,
                });
            } else {
                collection.modify({
                    emissions,
                });
            }
        });

        function getEmissions(
            zipInfo: ZipInfoResponse,
            releaseYear: number,
            studyPeriod: number | undefined,
            eiaCase: Case,
            rate: EmissionsRateType,
            ghgDataSource: GhgDataSource,
            fuelType: FuelType,
        ): Observable<number[]> {
            console.log(zipInfo);

            const common = {
                from: releaseYear,
                to: releaseYear + (studyPeriod ?? 0),
                release_year: releaseYear,
                case: EIA_CASE_MAP[eiaCase],
                rate: RATE_MAP[rate],
            };

            return Match.value(fuelType).pipe(
                Match.when(FuelType.ELECTRICITY, () => {
                    if (ghgDataSource === GhgDataSource.NIST_NETL)
                        return makeApiRequest<number[]>("region_case_ba", { ...common, ba: zipInfo.ba });

                    return makeApiRequest<number[]>("region_case_reeds", { ...common, padd: zipInfo.reeds_ba });
                }),
                Match.when(FuelType.NATURAL_GAS, () =>
                    makeApiRequest<number[]>("region_natgas", { ...common, technobasin: zipInfo.technobasin }),
                ),
                Match.whenOr(FuelType.DISTILLATE_OIL, FuelType.RESIDUAL_OIL, () =>
                    makeApiRequest<number[]>("region_case_oil", {
                        ...common,
                        padd: zipInfo.padd,
                    }),
                ),
                Match.when(FuelType.PROPANE, () =>
                    makeApiRequest<number[]>("region_case_propane_lng", {
                        ...common,
                        padd: zipInfo.padd,
                    }),
                ),
                Match.when(FuelType.COAL, () => of(Array(studyPeriod).fill(COAL_KG_CO2E_PER_MEGAJOULE))),
                Match.orElse(() => of(Array(studyPeriod).fill(0))),
            );
        }
    }

    export namespace Actions {
        export function setCostPerUnit(change: number | null) {
            if (change !== null) costPerUnit.set(change);
        }

        export function setAnnualConsumption(change: number | null) {
            if (change !== null) annualConsumption.set(change);
        }

        export function setRebate(change: number | null) {
            if (change !== null) rebate.set(change);
            else rebate.set(undefined);
        }

        export function setDemandCharge(change: number | null) {
            if (change !== null) demandCharge.set(change);
            else demandCharge.set(undefined);
        }

        export function setFueltype(change: FuelType) {
            // Set fuel type
            fuelType.set(change);

            // Coal can only be set with an industrial customer sector
            if (change === FuelType.COAL) customerSector.set(CustomerSector.INDUSTRIAL);
        }

        export function setCustomerSector(change: CustomerSector) {
            customerSector.set(change);
        }
    }
}
