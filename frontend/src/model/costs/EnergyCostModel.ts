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
import { CostModel } from "model/CostModel";
import { isEnergyCost, isNonUSLocation, isUSLocation } from "model/Guards";
import { type LocationModel, Model, Var } from "model/Model";
import * as O from "optics-ts";
import { type Observable, Subject, combineLatest, distinctUntilChanged, map, merge, of, switchMap } from "rxjs";
import { catchError, combineLatestWith, filter, shareReplay, startWith, tap, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { COAL_KG_CO2_PER_MEGAJOULE } from "util/UnitConversion";
import { index, makeApiRequest } from "util/Util";
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

type EscalationRateResponse = {
    case: string;
    release_year: number;
    year: number;
    division: string;
    electricity: number;
    natural_gas: number;
    propane: number;
    region: string;
    residual_fuel_oil: number;
    distillate_fuel_oil: number;
    sector: string;
};

const EIA_CASE_MAP = {
    [Case.REF]: "REF",
    [Case.LOWZTC]: "LRC",
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
        export const [isUsingCustomLocation] = bind(location.$.pipe(map((location) => location !== undefined)));

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
        fuelType.$.pipe(
            map((fuelType) => {
                if (fuelType === FuelType.COAL) return [CustomerSector.INDUSTRIAL];

                return Object.values(CustomerSector);
            }),
            startWith(Object.values(CustomerSector)),
        ),
    );

    // Gets the default escalation rate information from the api
    export const fetchEscalationRates$ = combineLatest([
        Model.releaseYear.$,
        Model.studyPeriod.$,
        Location.globalOrCustomZip$,
        customerSector.$,
        Model.case$,
    ]).pipe(
        tap((inputs) => console.log("Inputs: ", inputs)),
        switchMap(([releaseYear, studyPeriod, zip, sector, eiaCase]) =>
            makeApiRequest<EscalationRateResponse[]>("escalation_rates", {
                release_year: releaseYear,
                from: releaseYear,
                to: releaseYear + (studyPeriod ?? 0),
                zip: Number.parseInt(zip ?? "0"),
                sector,
                case: eiaCase,
            }),
        ),
        combineLatestWith(fuelType.$),
        map(([response, fuelType]) =>
            response.map((value) =>
                match(fuelType)
                    .with(FuelType.ELECTRICITY, () => value.electricity)
                    .with(FuelType.PROPANE, () => value.propane)
                    .with(FuelType.DISTILLATE_OIL, () => value.distillate_fuel_oil)
                    .with(FuelType.RESIDUAL_OIL, () => value.residual_fuel_oil)
                    .with(FuelType.NATURAL_GAS, () => value.natural_gas)
                    .otherwise(() => 0),
            ),
        ),
        catchError(() => of([] as number[])),
        shareLatest(),
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
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([unit, costCollection]) => costCollection.modify({ unit }));

    export namespace Emissions {
        export const emissions$: Observable<number[] | undefined> = combineLatest([
            Location.zipInfo$,
            Model.releaseYear.$,
            Model.studyPeriod.$,
            Model.case$,
            Model.emissionsRateType.$,
            Model.ghgDataSource.$,
            fuelType.$,
        ]).pipe(
            switchMap(([zipInfo, releaseYear, studyPeriod, eiaCase, rate, ghgDataSource, fuelType]) =>
                getEmissions(zipInfo, releaseYear, studyPeriod, eiaCase, rate, ghgDataSource, fuelType),
            ),
        );
        emissions$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([emissions, collection]) => {
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

            return match(fuelType)
                .with(FuelType.ELECTRICITY, () => {
                    if (ghgDataSource === GhgDataSource.NIST_NETL)
                        return makeApiRequest<number[]>("region_case_ba", { ...common, ba: zipInfo.ba });

                    return makeApiRequest<number[]>("region_case_reeds", { ...common, padd: zipInfo.reeds_ba });
                })
                .with(FuelType.NATURAL_GAS, () =>
                    makeApiRequest<number[]>("region_natgas", { ...common, technobasin: zipInfo.technobasin }),
                )
                .with(P.union(FuelType.DISTILLATE_OIL, FuelType.RESIDUAL_OIL), () =>
                    makeApiRequest<number[]>("region_case_oil", {
                        ...common,
                        padd: zipInfo.padd,
                    }),
                )
                .with(FuelType.PROPANE, () =>
                    makeApiRequest<number[]>("region_case_propane_lng", {
                        ...common,
                        padd: zipInfo.padd,
                    }),
                )
                .with(FuelType.COAL, () => of(Array(studyPeriod).fill(COAL_KG_CO2_PER_MEGAJOULE)))
                .otherwise(() => of(Array(studyPeriod).fill(0)));
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
