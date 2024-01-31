import { expect, test } from "vitest";
import { firstValueFrom, of } from "rxjs";
import { convert } from "./Converter";
import { Version } from "./Verison";
import {
    AnalysisType,
    CapitalCost,
    CostTypes,
    CustomerSector,
    DiscountingMethod,
    DollarMethod,
    DollarOrPercent,
    EnergyCost,
    EnergyUnit,
    FuelType,
    OMRCost,
    USLocation
} from "./Format";

const federalFinanced =
    '<?xml version="1.0"?>\n' +
    "<Project>\n" +
    "  <Name>Lighting/Daylighting</Name>\n" +
    "  <Comment>Replace existing lighting system with \n" +
    "new system financed through a utility \n" +
    "contract.</Comment>\n" +
    "  <Location>Arizona</Location>\n" +
    "  <Analyst>Derek Filben</Analyst>\n" +
    "  <AnalysisType>1</AnalysisType>\n" +
    "  <AnalysisPurpose>2</AnalysisPurpose>\n" +
    "  <DollarMethod>1</DollarMethod>\n" +
    "  <BaseDate>April 1, 2022</BaseDate>\n" +
    "  <PCPeriod>0 years 0 months</PCPeriod>\n" +
    "  <Duration>15 years 0 months</Duration>\n" +
    "  <DiscountingMethod>1</DiscountingMethod>\n" +
    "  <DiscountRate>0.03</DiscountRate>\n" +
    "  <Alternatives>\n" +
    "    <Alternative>\n" +
    "      <Name>Existing</Name>\n" +
    "      <Comment>Base Case: Keep existing system for\n" +
    "remaining 15 years of its useful life. </Comment>\n" +
    "      <CapitalComponents>\n" +
    "        <CapitalComponent>\n" +
    "          <Name>Existing System</Name>\n" +
    "          <Comment>Keep existing system for the remaining\n" +
    "15 years of its useful life.</Comment>\n" +
    "          <Duration>15 years 0 months</Duration>\n" +
    "            <Escalation>\n" +
    "              <SimpleEscalation>\n" +
    "              </SimpleEscalation>\n" +
    "            </Escalation>\n" +
    "          <PhaseIn>\n" +
    "            <PhaseIn>\n" +
    "              <Portions>1.0\n" +
    "              </Portions>\n" +
    "              <Intervals>0 years 0 months\n" +
    "              </Intervals>\n" +
    "            </PhaseIn>\n" +
    "          </PhaseIn>\n" +
    "          <ResaleEscalation>\n" +
    "            <SimpleEscalation>\n" +
    "            </SimpleEscalation>\n" +
    "          </ResaleEscalation>\n" +
    "          <RecurringCosts>\n" +
    "            <RecurringCost>\n" +
    "              <Name>cost</Name>\n" +
    "              <Duration>Remaining</Duration>\n" +
    "              <Amount>5600.0</Amount>\n" +
    "              <Escalation>\n" +
    "                <SimpleEscalation>\n" +
    "                </SimpleEscalation>\n" +
    "              </Escalation>\n" +
    "              <Index>\n" +
    "                <UsageIndex>\n" +
    "                  <Intervals>Remaining\n" +
    "                  </Intervals>\n" +
    "                  <Values>1.0\n" +
    "                  </Values>\n" +
    "                </UsageIndex>\n" +
    "              </Index>\n" +
    "            </RecurringCost>\n" +
    "          </RecurringCosts>\n" +
    "        </CapitalComponent>\n" +
    "      </CapitalComponents>\n" +
    "      <EnergyUsages>\n" +
    "        <EnergyUsage>\n" +
    "          <FuelType>Electricity</FuelType>\n" +
    "          <Name>Electricity</Name>\n" +
    "          <Duration>Remaining</Duration>\n" +
    "          <YearlyUsage>1082633.0</YearlyUsage>\n" +
    "          <Units>kWh</Units>\n" +
    "          <UnitCost>0.046</UnitCost>\n" +
    "          <DemandCharge>30105.0</DemandCharge>\n" +
    "          <UsageIndex>\n" +
    "            <UsageIndex>\n" +
    "              <Intervals>Remaining\n" +
    "              </Intervals>\n" +
    "              <Values>1.0\n" +
    "              </Values>\n" +
    "            </UsageIndex>\n" +
    "          </UsageIndex>\n" +
    "          <State>Arizona</State>\n" +
    "          <RateSchedule>Commercial</RateSchedule>\n" +
    "          <Emissions>Arizona</Emissions>\n" +
    "        </EnergyUsage>\n" +
    "      </EnergyUsages>\n" +
    "    </Alternative>\n" +
    "    <Alternative>\n" +
    "      <Name>Lighting Retrofit</Name>\n" +
    "      <CapitalComponents>\n" +
    "        <CapitalComponent>\n" +
    "          <Name>New System</Name>\n" +
    "          <Comment>Install new lighting/daylighting system\n" +
    "financed through UC contract</Comment>\n" +
    "          <AmountFinanced>390480.0</AmountFinanced>\n" +
    "          <Duration>20 years 0 months</Duration>\n" +
    "            <Escalation>\n" +
    "              <SimpleEscalation>\n" +
    "              </SimpleEscalation>\n" +
    "            </Escalation>\n" +
    "          <PhaseIn>\n" +
    "            <PhaseIn>\n" +
    "              <Portions>1.0\n" +
    "              </Portions>\n" +
    "              <Intervals>0 years 0 months\n" +
    "              </Intervals>\n" +
    "            </PhaseIn>\n" +
    "          </PhaseIn>\n" +
    "          <ResaleValueFactor>0.25</ResaleValueFactor>\n" +
    "          <ResaleEscalation>\n" +
    "            <SimpleEscalation>\n" +
    "            </SimpleEscalation>\n" +
    "          </ResaleEscalation>\n" +
    "          <RecurringCosts>\n" +
    "            <RecurringCost>\n" +
    "              <Name>Post-Contract OM Costs</Name>\n" +
    "              <Duration>Remaining</Duration>\n" +
    "              <Amount>3000.0</Amount>\n" +
    "              <Escalation>\n" +
    "                <SimpleEscalation>\n" +
    "                </SimpleEscalation>\n" +
    "              </Escalation>\n" +
    "              <Index>\n" +
    "                <UsageIndex>\n" +
    "                  <Intervals>10 years 0 months,Remaining\n" +
    "                  </Intervals>\n" +
    "                  <Values>0.0,1.0\n" +
    "                  </Values>\n" +
    "                </UsageIndex>\n" +
    "              </Index>\n" +
    "            </RecurringCost>\n" +
    "          </RecurringCosts>\n" +
    "        </CapitalComponent>\n" +
    "      </CapitalComponents>\n" +
    "      <EnergyUsages>\n" +
    "        <EnergyUsage>\n" +
    "          <FuelType>Electricity</FuelType>\n" +
    "          <Name>Electricity</Name>\n" +
    "          <Duration>Remaining</Duration>\n" +
    "          <YearlyUsage>206911.0</YearlyUsage>\n" +
    "          <Units>kWh</Units>\n" +
    "          <UnitCost>0.046</UnitCost>\n" +
    "          <DemandCharge>3311.0</DemandCharge>\n" +
    "          <UsageIndex>\n" +
    "            <UsageIndex>\n" +
    "              <Intervals>Remaining\n" +
    "              </Intervals>\n" +
    "              <Values>1.0\n" +
    "              </Values>\n" +
    "            </UsageIndex>\n" +
    "          </UsageIndex>\n" +
    "          <State>Arizona</State>\n" +
    "          <RateSchedule>Commercial</RateSchedule>\n" +
    "          <Emissions>Arizona</Emissions>\n" +
    "        </EnergyUsage>\n" +
    "      </EnergyUsages>\n" +
    "      <RecurringContractCosts>\n" +
    "        <RecurringContractCost>\n" +
    "          <Name>Annual Contract Payment</Name>\n" +
    "          <Duration>Remaining</Duration>\n" +
    "          <Amount>67000.0</Amount>\n" +
    "          <Escalation>\n" +
    "            <VaryingEscalation>\n" +
    "              <Intervals>Remaining\n" +
    "              </Intervals>\n" +
    "              <Values>-9.990009990008542E-4\n" +
    "              </Values>\n" +
    "            </VaryingEscalation>\n" +
    "          </Escalation>\n" +
    "          <Index>\n" +
    "            <UsageIndex>\n" +
    "              <Intervals>10 years 0 months,Remaining\n" +
    "              </Intervals>\n" +
    "              <Values>1.0,0.0\n" +
    "              </Values>\n" +
    "            </UsageIndex>\n" +
    "          </Index>\n" +
    "        </RecurringContractCost>\n" +
    "      </RecurringContractCosts>\n" +
    "    </Alternative>\n" +
    "  </Alternatives>\n" +
    "</Project>\n";

const result = await firstValueFrom(of(federalFinanced).pipe(convert()));
test("FederalFinanced.xml version", async () => {
    expect(result).toHaveProperty("version");
    expect(result.version).toBe(Version.V1);
});

test("FederalFinanced.xml name", async () => {
    expect(result).toHaveProperty("name");
    expect(result.name).toBe("Lighting/Daylighting");
});

test("FederalFinanced.xml description", async () => {
    expect(result).toHaveProperty("description");
    expect(result.description).toBe(
        "Replace existing lighting system with \nnew system financed through a utility \ncontract."
    );
});

test("FederalFinanced.xml analyst", async () => {
    expect(result).toHaveProperty("analyst");
    expect(result.analyst).toBe("Derek Filben");
});

test("FederalFinanced.xml analysis type", async () => {
    expect(result).toHaveProperty("analysisType");
    expect(result.analysisType).toBe(AnalysisType.FEDERAL_FINANCED);
});

test("FederalFinanced.xml purpose", async () => {
    expect(result).toHaveProperty("purpose");
    expect(result.purpose).toBeUndefined();
});

test("FederalFinanced.xml dollar method", async () => {
    expect(result).toHaveProperty("dollarMethod");
    expect(result.dollarMethod).toBe(DollarMethod.CURRENT);
});

test("FederalFinanced.xml study period", async () => {
    expect(result).toHaveProperty("studyPeriod");
    expect(result.studyPeriod).toBe(15);
});

test("FederalFinanced.xml construction period", async () => {
    expect(result).toHaveProperty("constructionPeriod");
    expect(result.constructionPeriod).toBe(0);
});

test("FederalFinanced.xml discounting method", async () => {
    expect(result).toHaveProperty("discountingMethod");
    expect(result.discountingMethod).toBe(DiscountingMethod.END_OF_YEAR);
});

test("FederalFinanced.xml real discount rate", async () => {
    expect(result).toHaveProperty("realDiscountRate");
    expect(result.realDiscountRate).toBe(0.03);
});

test("FederalFinanced.xml nominal discount rate", async () => {
    expect(result).toHaveProperty("nominalDiscountRate");
    expect(result.nominalDiscountRate).toBeUndefined();
});

test("FederalFinanced.xml inflation rate", async () => {
    expect(result).toHaveProperty("inflationRate");
    expect(result.inflationRate).toBeUndefined();
});

test("FederalFinanced.xml location", async () => {
    expect(result).toHaveProperty("location");
    expect(result.location).not.toBeUndefined();

    expect(result.location?.country).toBe("US");
    expect(result.location?.city).toBeUndefined();
    expect((result.location as USLocation)?.state).toBe("Arizona");
    expect((result.location as USLocation)?.zipcode).toBeUndefined();
});

test("FederalFinanced.xml alternatives are not undefined", async () => {
    expect(result).toHaveProperty("alternatives");
    expect(result.alternatives).not.toBeUndefined();
    expect(result.alternatives).toHaveLength(2);
});

test("FederalFinanced.xml first alternative", async () => {
    const alt = result.alternatives.get(0)!;

    expect(alt.id).toBe(0);
    expect(alt.name).toBe("Existing");
    expect(alt.baseline).toBeUndefined();
    expect(alt.costs).toHaveLength(3);
    expect(alt.costs).toStrictEqual([0, 1, 2]);
    expect(alt.description).toBe("Base Case: Keep existing system for\nremaining 15 years of its useful life.");
});

test("FederalFinanced.xml second alternative", async () => {
    const alt = result.alternatives.get(1)!;

    expect(alt.id).toBe(1);
    expect(alt.name).toBe("Lighting Retrofit");
    expect(alt.baseline).toBeUndefined();
    expect(alt.costs).toHaveLength(4);
    expect(alt.costs).toStrictEqual([3, 4, 5, 6]);
    expect(alt.description).toBeUndefined();
});

test("FederalFinanced.xml costs are not undefined", async () => {
    expect(result).toHaveProperty("costs");
    expect(result.costs).not.toBeUndefined();
    expect(result.costs).toHaveLength(7);
});

test("FederalFinanced.xml existing system cost", async () => {
    const cost = result.costs.get(0)!;
    expect(cost.id).toBe(0);
    expect(cost.name).toBe("Existing System");
    expect(cost.description).toBe("Keep existing system for the remaining\n15 years of its useful life.");
    expect(cost.location).toBeUndefined();
    expect(cost.type).toBe(CostTypes.CAPITAL);

    const capitalCost = cost as CapitalCost;
    expect(capitalCost.initialCost).toBeUndefined();
    expect(capitalCost.annualRateOfChange).toBeUndefined();
    expect(capitalCost.expectedLife).toBe(15);
    expect(capitalCost.costAdjustment).toBeUndefined();
    expect(capitalCost.phaseIn).toBeUndefined();
    expect(capitalCost.residualValue).toBeUndefined();
});

test("FederalFinanced.xml existing system recurring cost", async () => {
    const cost = result.costs.get(1)!;
    expect(cost.id).toBe(1);
    expect(cost.name).toBe("Existing System cost");
    expect(cost.description).toBeUndefined();
    expect(cost.location).toBeUndefined();
    expect(cost.type).toBe(CostTypes.OMR);

    const omrCost = cost as OMRCost;
    expect(omrCost.initialCost).toBe(5600.0);
    expect(omrCost.initialOccurrence).toBe(1);
    expect(omrCost.rateOfRecurrence).toBe(1);
});

test("FederalFinanced.xml electricity cost", async () => {
    const cost = result.costs.get(2)!;
    expect(cost.id).toBe(2);
    expect(cost.name).toBe("Electricity");
    expect(cost.description).toBeUndefined();
    expect(cost.type).toBe(CostTypes.ENERGY);

    const energyCost = cost as EnergyCost;
    expect(energyCost.fuelType).toBe(FuelType.ELECTRICITY);
    expect(energyCost.customerSector).toBe(CustomerSector.COMMERCIAL);
    expect(energyCost.location).not.toBeUndefined();
    expect(energyCost.location?.country).toBe("US");
    expect((energyCost.location as USLocation).state).toBe("Arizona");
    expect((energyCost.location as USLocation).city).toBeUndefined();
    expect((energyCost.location as USLocation).zipcode).toBeUndefined();
    expect(energyCost.costPerUnit).toBe(0.046);
    expect(energyCost.annualConsumption).toBe(1082633.0);
    expect(energyCost.unit).toBe(EnergyUnit.KWH);
    expect(energyCost.demandCharge).toBe(30105.0);
    expect(energyCost.rebate).toBeUndefined();
    expect(energyCost.escalation).toBeUndefined();
    expect(energyCost.useIndex).toBe(1);
});

test("FederalFinanced.xml new system cost", async () => {
    const cost = result.costs.get(3)!;
    expect(cost.id).toBe(3);
    expect(cost.name).toBe("New System");
    expect(cost.description).toBe("Install new lighting/daylighting system\nfinanced through UC contract");
    expect(cost.type).toBe(CostTypes.CAPITAL);
    expect(cost.location).toBeUndefined();

    const capitalCost = cost as CapitalCost;
    expect(capitalCost.initialCost).toBeUndefined();
    expect(capitalCost.amountFinanced).toBe(390480.0);
    expect(capitalCost.annualRateOfChange).toBeUndefined();
    expect(capitalCost.expectedLife).toBe(20);
    expect(capitalCost.costAdjustment).toBeUndefined();
    expect(capitalCost.phaseIn).toBeUndefined();
    expect(capitalCost.residualValue?.approach).toBe(DollarOrPercent.PERCENT);
    expect(capitalCost.residualValue?.value).toBe(0.25);
});

test("FederalFinanced.xml new system post-contract om costs", async () => {
    const cost = result.costs.get(4)!;
    expect(cost.id).toBe(4);
    expect(cost.name).toBe("New System Post-Contract OM Costs");
    expect(cost.description).toBeUndefined();
    expect(cost.location).toBeUndefined();

    const omrCost = cost as OMRCost;
    expect(omrCost.initialCost).toBe(3000.0);
    expect(omrCost.initialOccurrence).toBe(11);
    expect(omrCost.rateOfRecurrence).toBe(1);
});

test("FederalFinanced.xml ghg values are undefined", async () => {
    expect(result).toHaveProperty("ghg");
    expect(result.ghg.emissionsRateScenario).toBeUndefined();
    expect(result.ghg.socialCostOfGhgScenario).toBeUndefined();
});
