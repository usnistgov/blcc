import { CubicUnit, EnergyUnit, FuelType, LiquidUnit, type WaterUnit, type Unit } from "blcc-format/Format";
import convert from "convert";
import Decimal from "decimal.js";

type ConvertFunction = (value: number) => number;
type ConvertMap = { [key in Unit]?: ConvertFunction };

export const getConvertMap = (fuelType: FuelType): ConvertMap => {
    const energyConversionsMj = {
        [EnergyUnit.KWH]: (kWh: number) => convert(kWh, "kWh").to("megajoules"),
        [EnergyUnit.THERM]: (therm: number) => convert(thermToMWh(therm), "MWh").to("megajoules"),
        [EnergyUnit.GJ]: (gj: number) => convert(gj, "gigajoules").to("megajoules"),
        [EnergyUnit.MJ]: (mj: number) => mj,
        [EnergyUnit.MBTU]: (mbtu: number) => convert(mbtuToMWh(mbtu), "MWh").to("megajoules"),
    };

    switch (fuelType) {
        case FuelType.ELECTRICITY:
            return {
                [EnergyUnit.KWH]: (kWh: number) => convert(kWh, "kWh").to("MWh"),
                [EnergyUnit.THERM]: thermToMWh,
                [EnergyUnit.GJ]: (gj: number) => convert(gj, "gigajoules").to("MWh"),
                [EnergyUnit.MJ]: (mj: number) => convert(mj, "megajoules").to("MWh"),
                [EnergyUnit.MBTU]: mbtuToMWh,
            };
        case FuelType.NATURAL_GAS:
            return {
                ...energyConversionsMj,
                [CubicUnit.CUBIC_METERS]: naturalGasCubicMetersToMJ,
                [CubicUnit.CUBIC_FEET]: naturalGasCubicFeetToMJ,
            };
        case FuelType.PROPANE:
            return {
                ...energyConversionsMj,
                [LiquidUnit.LITER]: propaneLitersToMJ,
                [LiquidUnit.K_LITER]: propaneKiloliterToMJ,
                [LiquidUnit.GALLON]: propaneGallonToMJ,
                [LiquidUnit.K_GALLON]: propaneThousandGallonToMJ,
                [CubicUnit.CUBIC_FEET]: propaneCubicFeetToMJ,
                [CubicUnit.CUBIC_METERS]: propaneCubicMetersToMJ,
            };
        case FuelType.DISTILLATE_OIL:
        case FuelType.RESIDUAL_OIL:
            return {
                ...energyConversionsMj,
                [LiquidUnit.LITER]: propaneLitersToMJ,
                [LiquidUnit.K_LITER]: propaneKiloliterToMJ,
                [LiquidUnit.GALLON]: propaneGallonToMJ,
                [LiquidUnit.K_GALLON]: propaneThousandGallonToMJ,
            };
        case FuelType.COAL:
            return energyConversionsMj;
        default:
            return {};
    }
};

export const getConvertMapgJ = (fuelType: FuelType): ConvertMap => {
    return {
        [EnergyUnit.KWH]: (kWh: number) => convert(kWh, "kWh").to("gigajoules"),
        [EnergyUnit.THERM]: thermToGJ,
        [EnergyUnit.GJ]: (gj: number) => convert(gj, "gigajoules").to("gigajoules"),
        [EnergyUnit.MJ]: (mj: number) => convert(mj, "megajoules").to("gigajoules"),
        [EnergyUnit.MBTU]: mbtuToGJ,
    };
};

const PROPANE = 9.63e7; // J/gallon
const NATURAL_GAS = 1.09e6; // J/ft^3
const OIL = 41.868; // GJ/m ton
const COAL = 18.2; // GJ/m ton

const GALLON = 3.785;
const K_GALLON = 3785;
const K_LITER = 1000;
const CUBIC_METERS = 1000;
const CUBIC_FEET = 28.317;

export const COAL_KG_CO2E_PER_MEGAJOULE = 0.09042;

function thermToMWh(therm: number) {
    return therm / 34.13;
}

function mbtuToMWh(mbtu: number) {
    return mbtu / 3412000;
}

function naturalGasCubicMetersToMJ(cubicMeters: number) {
    return naturalGasCubicFeetToMJ(convert(cubicMeters, "cubic meters").to("cubic feet"));
}

function naturalGasCubicFeetToMJ(cubicFeet: number) {
    // Approximate 1 cubic foot * natural gas constant as one 1 joule
    return Decimal.div(cubicFeet * NATURAL_GAS, 1000).toNumber();
}

function propaneLitersToMJ(liter: number) {
    return propaneGallonToMJ(convert(liter, "liters").to("gallons"));
}

function propaneKiloliterToMJ(kiloliter: number) {
    return propaneLitersToMJ(kiloliter * 1000);
}

function propaneGallonToMJ(gallon: number) {
    // Approximate 1 gallon * propane constant as 1 joule
    return Decimal.div(gallon * PROPANE, 1000).toNumber();
}

function propaneThousandGallonToMJ(gallon: number) {
    return propaneGallonToMJ(gallon * 1000);
}

function propaneCubicMetersToMJ(cubicMeters: number) {
    const joules = convert(cubicMeters, "cubic meters").to("gallons") * PROPANE;
    return Decimal.div(joules, 1000).toNumber();
}

function propaneCubicFeetToMJ(cubicFeet: number) {
    const joules = convert(cubicFeet, "cubic feet").to("gallons") * PROPANE;
    return Decimal.div(joules, 1000).toNumber();
}

function thermToGJ(therm: number) {
    return therm / 9.48;
}

function mbtuToGJ(mbtu: number) {
    return mbtu * 1.06;
}

export function convertToLiters(amount: number, unit: WaterUnit): number {
    switch (unit) {
        case LiquidUnit.GALLON:
            return Decimal.mul(amount, GALLON).toNumber();
        case LiquidUnit.K_GALLON:
            return Decimal.mul(amount, K_GALLON).toNumber();
        case LiquidUnit.K_LITER:
            return Decimal.mul(amount, K_LITER).toNumber();
        case CubicUnit.CUBIC_METERS:
            return Decimal.mul(amount, CUBIC_METERS).toNumber();
        case LiquidUnit.LITER:
            return amount;
        case CubicUnit.CUBIC_FEET:
            return Decimal.mul(amount, CUBIC_FEET).toNumber();
    }
}

export function convertCostPerUnitToLiters(amount: number, unit: WaterUnit): number {
    switch (unit) {
        case LiquidUnit.GALLON:
            return Decimal.div(amount, GALLON).toNumber();
        case LiquidUnit.K_GALLON:
            return Decimal.div(amount, K_GALLON).toNumber();
        case LiquidUnit.K_LITER:
            return Decimal.div(amount, K_LITER).toNumber();
        case CubicUnit.CUBIC_METERS:
            return Decimal.div(amount, CUBIC_METERS).toNumber();
        case LiquidUnit.LITER:
            return amount;
        case CubicUnit.CUBIC_FEET:
            return Decimal.div(amount, CUBIC_FEET).toNumber();
    }
}
