import { WebSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Layer, ManagedRuntime } from "effect";
import { DexieService } from "model/db";
import { ConverterService } from "services/ConverterService";
import { XmlParserService } from "services/XmlParserService";

const WebSdkLive = WebSdk.layer(() => ({
    resource: { serviceName: "BLCC" },
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const MainLayer = Layer.mergeAll(DexieService.Default, XmlParserService.Default, ConverterService.Default, WebSdkLive);

export const BlccRuntime = ManagedRuntime.make(MainLayer);
