import { CubicUnit, EnergyUnit, FuelType, LiquidUnit, type Unit } from "blcc-format/Format";
import convert from "convert";

type ConvertFunction = (value: number) => number;
type ConvertMap = { [key in Unit]?: ConvertFunction };

export const getConvertMap = (fuelType: FuelType): ConvertMap => {
    const energyConversions = {
        [EnergyUnit.KWH]: (kWh: number) => convert(kWh, "kWh").to("MWh"),
        [EnergyUnit.THERM]: thermToMWh,
        [EnergyUnit.GJ]: (gj: number) => convert(gj, "gigajoules").to("MWh"),
        [EnergyUnit.MJ]: (mj: number) => convert(mj, "megajoules").to("MWh"),
        [EnergyUnit.MBTU]: mbtuToMWh,
    };

    switch (fuelType) {
        case FuelType.ELECTRICITY:
            return energyConversions;
        case FuelType.NATURAL_GAS:
            return {
                ...energyConversions,
                [CubicUnit.CUBIC_METERS]: naturalGasCubicMetersToMWh,
                [CubicUnit.CUBIC_FEET]: naturalGasCubicFeetToMWh,
            };
        case FuelType.PROPANE:
            return {
                ...energyConversions,
                [LiquidUnit.LITER]: propaneLitersToMwh,
                [LiquidUnit.K_LITER]: propaneKiloliterToMwh,
                [LiquidUnit.GALLON]: propaneGallonToMWh,
                [LiquidUnit.K_GALLON]: propaneThousandGallonToMWh,
                [CubicUnit.CUBIC_FEET]: propaneCubicFeetToMWh,
                [CubicUnit.CUBIC_METERS]: propaneCubicMetersToMWh,
            };
        case FuelType.DISTILLATE_OIL:
        case FuelType.RESIDUAL_OIL:
            return {
                ...energyConversions,
            };
        case FuelType.COAL:
            return {
                [EnergyUnit.KWH]: (kWh: number) => convert(kWh, "kWh").to("megajoules"),
                [EnergyUnit.THERM]: (therm: number) => convert(thermToMWh(therm), "MWh").to("megajoules"),
                [EnergyUnit.GJ]: (gj: number) => convert(gj, "gigajoules").to("megajoules"),
                [EnergyUnit.MJ]: (mj: number) => mj,
                [EnergyUnit.MBTU]: (mbtu: number) => convert(mbtuToMWh(mbtu), "MWh").to("megajoules"),
            };
        default:
            return {};
    }
};

const PROPANE = 9.63e7; // J/gallon
const NATURAL_GAS = 1.09e6; // J/ft^3
const OIL = 41.868; // GJ/m ton
const COAL = 18.2; // GJ/m ton

export const COAL_KG_CO2_PER_MEGAJOULE = 0.09042;

function thermToMWh(therm: number) {
    return therm / 34.13;
}

function mbtuToMWh(mbtu: number) {
    return mbtu / 3412000;
}

function naturalGasCubicMetersToMWh(cubicMeters: number) {
    return naturalGasCubicFeetToMWh(convert(cubicMeters, "cubic meters").to("cubic feet"));
}

function naturalGasCubicFeetToMWh(cubicFeet: number) {
    return convert(cubicFeet * NATURAL_GAS, "joules").to("mWh");
}

function propaneLitersToMwh(liter: number) {
    return propaneGallonToMWh(convert(liter, "liters").to("gallons"));
}

function propaneKiloliterToMwh(kiloliter: number) {
    return propaneLitersToMwh(kiloliter * 1000);
}

function propaneGallonToMWh(gallon: number) {
    return convert(gallon * PROPANE, "joules").to("MWh");
}

function propaneThousandGallonToMWh(gallon: number) {
    return propaneGallonToMWh(gallon * 1000);
}

function propaneCubicMetersToMWh(cubicMeters: number) {
    return convert(convert(cubicMeters, "cubic meters").to("gallons") * PROPANE, "joules").to("MWh");
}

function propaneCubicFeetToMWh(cubicFeet: number) {
    return convert(convert(cubicFeet, "cubic feet").to("gallons") * PROPANE, "joules").to("MWh");
}
