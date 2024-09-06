import { bind } from "@react-rxjs/core";
import { Divider } from "antd";
import { Dropdown } from "components/input/Dropdown";
import TextInput, { TextInputType } from "components/input/TextInput";
import { Country, State } from "constants/LOCATION";
import { useMemo } from "react";
import type { Observable, Subject } from "rxjs";
import { Strings } from "constants/Strings";
import Nbsp from "util/Nbsp";

type LocationProps = {
    sCountry$: Subject<Country>;
    country$: Observable<Country | undefined>;
    sCity$: Subject<string | undefined>;
    city$: Observable<string | undefined>;
    sState$: Subject<State>;
    state$: Observable<State | undefined>;
    sZip$: Subject<string | undefined>;
    zip$: Observable<string | undefined>;
    sStateOrProvince$: Subject<string | undefined>;
    stateOrProvince$: Observable<string | undefined>;
};

export default function Location({
    sCity$,
    city$,
    sCountry$,
    country$,
    sState$,
    state$,
    sZip$,
    zip$,
    sStateOrProvince$,
    stateOrProvince$,
}: LocationProps) {
    const useCountry = useMemo(() => {
        const [useCountry] = bind(country$, Country.USA);
        return useCountry;
    }, [country$]);

    const country = useCountry();

    return (
        <>
            <Dropdown
                label={"Country"}
                className={"w-full"}
                info={Strings.COUNTRY}
                options={Object.values(Country)}
                wire={sCountry$}
                value$={country$}
            />
            <TextInput label={"City"} info={Strings.CITY} type={TextInputType.PRIMARY} value$={city$} wire={sCity$} />
            {country === Country.USA ? (
                <Dropdown
                    label={"State"}
                    className={"w-full"}
                    info={Strings.STATE}
                    options={Object.values(State)}
                    wire={sState$}
                    value$={state$}
                />
            ) : (
                <TextInput
                    label={"State"}
                    info={Strings.STATE}
                    type={TextInputType.PRIMARY}
                    value$={stateOrProvince$}
                    wire={sStateOrProvince$}
                />
            )}
            {country === Country.USA && (
                <TextInput
                    label={
                        <>
                            Zip
                            <Nbsp />*
                        </>
                    }
                    info={Strings.ZIP}
                    type={TextInputType.PRIMARY}
                    value$={zip$}
                    wire={sZip$}
                    maxLength={5}
                />
            )}
        </>
    );
}
