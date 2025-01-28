import { TestInput } from "components/input/TestInput";
import { TestSelect } from "components/input/TestSelect";
import { TextInputType } from "components/input/TextInput";
import { Country, State } from "constants/LOCATION";
import { Strings } from "constants/Strings";
import type { LocationModel } from "model/Model";
import type React from "react";

/**
 * Returns a form component for entering the state or province of a location.
 * If the country is the United States, this component is a dropdown with all 50 states.
 * Otherwise, this component is a text input.
 */
function StateOrProvince<T>({ model }: { model: LocationModel<T> }) {
    return model.country.use() === Country.USA ? (
        <TestSelect
            label={"State"}
            className={"w-full"}
            info={Strings.STATE}
            options={Object.values(State)}
            getter={model.state.use}
            onChange={(state) => model.state.set(state)}
        />
    ) : (
        <TestInput
            name={"stateProvince"}
            label={"State or Province"}
            info={Strings.STATE}
            type={TextInputType.PRIMARY}
            getter={model.stateProvince.use}
            onChange={(event) => model.stateProvince.set(event.currentTarget.value)}
        />
    );
}

/**
 * Returns a handler function for updating the zipcode.
 *
 * The handler validates the input to ensure it is either a 5-digit number or empty.
 * If valid, it updates the zipcode in the given `model`.
 *
 * @param model - The location model containing the zipcode to be updated.
 * @returns A function to handle the change event for a zipcode input.
 */
function setZipcodeHandler<T>(model: LocationModel<T>): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
        // Only allow 5-digit numbers or empty
        const value = event.currentTarget.value;
        if (/^\d+$/.test(value) || value === "") model.zipcode.set(value);
    };
}

/**
 * Returns a form component for entering a zipcode.
 * This component is only visible if the country is the United States.
 * The zipcode must be a 5-digit number.
 */
function Zipcode<T>({ model }: { model: LocationModel<T> }) {
    if (model.country.use() !== Country.USA) return;

    return (
        <TestInput
            label={"Zipcode"}
            required
            info={Strings.ZIP}
            type={TextInputType.PRIMARY}
            getter={model.zipcode.use}
            onChange={setZipcodeHandler(model)}
            maxLength={5}
            error={model.zipcode.useValidation}
        />
    );
}

/**
 * Returns a function that sets the country of the given `model` to the given
 * `country`, and resets the state and zipcode (if the country is not the
 * United States), or the state/province (if it is the United States).
 *
 * @param model - The location model
 * @returns Function that takes a country and updates the model
 */
function setCountryHandler<T>(model: LocationModel<T>): (country: Country) => void {
    return (country) => {
        // If the country is not the United States, clear the state and zipcode
        // otherwise clear the state/province
        if (country !== Country.USA) {
            model.state.set(undefined);
            model.zipcode.set(undefined);
        } else {
            model.stateProvince.set(undefined);
        }

        // Set the country
        model.country.set(country);
    };
}

/**
 * A form component for entering a location.
 *
 * The location consists of four parts:
 * 1. Country, which is a dropdown with all countries.
 * 2. City, which is a text input.
 * 3. State or Province, which is either a dropdown with all 50 US states
 *    (if the country is the United States) or a text input (otherwise).
 * 4. Zipcode, which is a text input that must be a 5-digit number
 *    (only visible if the country is the United States).
 */
export default function Location<T>({ model }: { model: LocationModel<T> }) {
    return (
        <>
            <TestSelect
                label={"Country"}
                className={"w-full"}
                info={Strings.COUNTRY}
                options={Object.values(Country)}
                getter={model.country.use}
                onChange={setCountryHandler(model)}
            />
            <TestInput
                name={"city"}
                label={"City"}
                info={Strings.CITY}
                type={TextInputType.PRIMARY}
                getter={model.city.use}
                onChange={(event) => model.city.set(event.currentTarget.value)}
            />
            <StateOrProvince model={model} />
            <Zipcode model={model} />
        </>
    );
}
