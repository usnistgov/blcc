import { bind } from "@react-rxjs/core";
import { map, of, switchMap } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";
import { AnalysisType, DiscountingMethod, DollarMethod, NonUSLocation, USLocation } from "../blcc-format/Format";
import { Country } from "../constants/LOCATION";
import { filter } from "rxjs/operators";

// NEW

export const currentProject$ = of(1);

const dbProject$ = currentProject$.pipe(
    switchMap((currentID) => liveQuery(() => db.projects.where("id").equals(currentID).first())),
    guard()
);

export const name$ = dbProject$.pipe(map((p) => p.name));
export const [useName] = bind(name$, "");

export const analyst$ = dbProject$.pipe(map((p) => p.analyst));
export const [useAnalyst] = bind(analyst$, undefined);

export const description$ = dbProject$.pipe(map((p) => p.description));
export const [useDescription] = bind(description$, undefined);

export const analysisType$ = dbProject$.pipe(map((p) => p.analysisType));
export const [useAnalysisType] = bind(analysisType$, AnalysisType.FEDERAL_FINANCED);

export const purpose$ = dbProject$.pipe(map((p) => p.purpose));
export const [usePurpose] = bind(purpose$, undefined);

export const studyPeriod$ = dbProject$.pipe(map((p) => p.studyPeriod));
export const [useStudyPeriod] = bind(studyPeriod$, 25);

export const constructionPeriod$ = dbProject$.pipe(map((p) => p.constructionPeriod));
export const [useConstructionPeriod] = bind(constructionPeriod$, 0);

export const dollarMethod$ = dbProject$.pipe(map((p) => p.dollarMethod));
export const [useDollarMethod] = bind(dollarMethod$, DollarMethod.CONSTANT);

export const inflationRate$ = dbProject$.pipe(map((p) => p.inflationRate));
export const [useInflationRate] = bind(inflationRate$, undefined);

export const nominalDiscountRate$ = dbProject$.pipe(map((p) => p.nominalDiscountRate));
export const [useNominalDiscountRate] = bind(nominalDiscountRate$, undefined);

export const realDiscountRate$ = dbProject$.pipe(map((p) => p.realDiscountRate));
export const [useRealDiscountRate] = bind(realDiscountRate$, undefined);

export const discountingMethod$ = dbProject$.pipe(map((p) => p.discountingMethod));
export const [useDiscountingMethod] = bind(discountingMethod$, DiscountingMethod.END_OF_YEAR);

export const location$ = dbProject$.pipe(map((p) => p.location));

export const country$ = location$.pipe(map((p) => p.country));
export const [useCountry] = bind(country$, Country.USA);

export const city$ = location$.pipe(map((p) => p.city));
export const usLocation$ = location$.pipe(
    filter((location): location is USLocation => location.country === Country.USA)
);
export const nonUSLocation$ = location$.pipe(
    filter((location): location is NonUSLocation => location.country !== Country.USA)
);
export const state$ = usLocation$.pipe(map((usLocation) => usLocation.state));
export const stateOrProvince$ = nonUSLocation$.pipe(map((nonUSLocation) => nonUSLocation.stateProvince));
export const zip$ = usLocation$.pipe(map((p) => p.zipcode));

export const emissionsRate$ = dbProject$.pipe(map((p) => p.ghg.emissionsRateScenario));
export const socialCostOfGhgScenario$ = dbProject$.pipe(map((p) => p.ghg.socialCostOfGhgScenario));

export const alternativeIDs$ = dbProject$.pipe(map((p) => p.alternatives));
export const [useAlternativeIDs] = bind(alternativeIDs$, []);

export const alternatives$ = alternativeIDs$.pipe(
    switchMap((ids) => liveQuery(() => db.alternatives.where("id").anyOf(ids).toArray()))
);
export const [useAlternatives] = bind(alternatives$, []);

export const costIDs$ = dbProject$.pipe(map((p) => p.costs));
export const [useCostIDs] = bind(costIDs$, []);
