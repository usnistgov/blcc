import { Case, CustomerSector } from "blcc-format/Format";
import { Schema } from "effect";

function literals(values: string[]) {
    return values.map((str) => Schema.Literal(str));
}

const snakeCaseToCamelCase = Schema.transform(Schema.String, Schema.String, {
    strict: true,
    decode: (literal) =>
        literal
            .split("_")
            .map((str, i) => (i !== 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str))
            .join(""),
    encode: (literal) => (literal.match(/[A-Z][a-z]+/g) ?? [""]).map((str) => str.toLowerCase()).join("_"),
});

export class ReleaseYear extends Schema.Class<ReleaseYear>("ReleaseYear")({
    year: Schema.Number,
    max: Schema.Number,
    min: Schema.Number,
}) {}

export const decodeReleaseYear = Schema.decodeUnknown(Schema.Array(ReleaseYear));

export class EscalationRateRequest extends Schema.Class<EscalationRateRequest>("EscalationRateRequest")({
    releaseYear: Schema.Number,
    from: Schema.Number,
    to: Schema.Number,
    zip: Schema.Number,
    sector: Schema.Union(...literals(Object.values(CustomerSector))),
    case: Schema.Union(...literals(Object.values(Case))),
}) {}

export const encodeEscalationRateRequest = Schema.encode(EscalationRateRequest);

export class EscalationRateResponse extends Schema.Class<EscalationRateResponse>("EscalationRateResponse")({
    releaseYear: Schema.Number,
    year: Schema.Number,
    division: Schema.String,
    sector: Schema.Union(...literals(Object.values(CustomerSector))),
    case: Schema.Union(...literals(Object.values(Case))),
    region: Schema.String,
    propane: Schema.NullOr(Schema.Number),
    distillateFuelOil: Schema.NullOr(Schema.Number),
    residualFuelOil: Schema.NullOr(Schema.Number),
    naturalGas: Schema.NullOr(Schema.Number),
    electricity: Schema.NullOr(Schema.Number),
    coal: Schema.NullOr(Schema.Number),
}) {}

export const EscalationRates = Schema.Array(EscalationRateResponse);

export const decodeEscalationRateResponse = Schema.decodeUnknown(EscalationRates);

export const decodeNumberArray = Schema.decodeUnknown(Schema.Array(Schema.Number));

export class DiscountRatesResponse extends Schema.Class<DiscountRatesResponse>("DiscountRatesResponse")({
    releaseYear: Schema.Number,
    rate: Schema.String,
    year: Schema.Number,
    real: Schema.Number,
    nominal: Schema.Number,
    inflation: Schema.Number,
}) {}

export const decodeDiscountRatesResponse = Schema.decodeUnknown(Schema.Array(DiscountRatesResponse));
