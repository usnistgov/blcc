import { CubicUnit, EnergyUnit, Unit } from "../blcc-format/Format";

export const toMWh: { [key: Unit]: (unit: number) => number } = {
    [EnergyUnit.KWH]: kWhToMWh,
    [EnergyUnit.THERM]: thermToMWh,
    [EnergyUnit.GJ]: gjToMWh,
    [EnergyUnit.MJ]: mjToMWh,
    [EnergyUnit.MBTU]: mbtuToMWh,
    [CubicUnit.CUBIC_METERS]: cubicMetersToMWh,
    [CubicUnit.CUBIC_FEET]: cubicFeetToMWh
};

export function kWhToMWh(kwh: number) {
    return kwh / 1000;
}

export function thermToMWh(therm: number) {
    return therm / 34.13;
}

export function gjToMWh(gj: number) {
    return gj / 3.6;
}

export function mjToMWh(mj: number) {
    return mj / 3600;
}

export function mbtuToMWh(mbtu: number) {
    return mbtu / 3412000;
}

export function cubicMetersToMWh(cubicMeters: number) {
    return cubicMeters * 0.11;
}

export function cubicFeetToMWh(cubicFeet: number) {
    return cubicFeet * 0.000299;
}
