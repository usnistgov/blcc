import { Data, Effect } from "effect";
import { XMLParser } from "fast-xml-parser";

export class XmlParseError extends Data.TaggedError("XmlParseError") {}

export class XmlParserService extends Effect.Service<XmlParserService>()("XmlParserService", {
    effect: Effect.gen(function* () {
        const parser = new XMLParser();

        return {
            parse: (xml: string) =>
                Effect.try({
                    try: () => parser.parse(xml),
                    catch: () => new XmlParseError(),
                }),
        };
    }),
}) {}
