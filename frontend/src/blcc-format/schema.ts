import { Schema } from "effect";

export class ReleaseYear extends Schema.Class<ReleaseYear>("ReleaseYear")({
    year: Schema.Number,
    max: Schema.Number,
    min: Schema.Number,
}) {}

export const decodeReleaseYear = Schema.decodeUnknown(Schema.Array(ReleaseYear));
