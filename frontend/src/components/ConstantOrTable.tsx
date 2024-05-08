import Title from "antd/es/typography/Title";
import { type Observable, of, Subject } from "rxjs";
import { bind, state, StateObservable } from "@react-rxjs/core";
import numberInput, { NumberInputProps } from "./InputNumber";
import type { PropsWithChildren } from "react";
import { match, P } from "ts-pattern";
import { Rxjs } from "../util/Util";

export type ConstantOrTableProps = {
    title: string;
};

export default function constantOrTable<T>(
    values$: Observable<T[] | T>,
) {
    const [useValues] = bind(values$, [] as T[]);

/*    const { component: ConstantSwitch, onChange$: switchChange$ } = switchComp(values$.pipe(
        map((values) => match(values)
            .with(P.array(), () => false)
            .otherwise(() => true)
        ))
    );*/
    const { component: ConstantInput } = numberInput("", "");

   /* switchChange$.subscribe()*/

    return {
        toggleConstant$: of(true),//switchChange$,
        component: function ConstantOrTable({
            title,
            children
        }: PropsWithChildren<ConstantOrTableProps>) {
            return <div>
                <Title level={5}>{title}</Title>
                <span className={"flex flex-row items-center gap-2 pb-2"}>
                    <p className={"text-md pb-1"}>Constant</p>
                    {/*<ConstantSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />*/}
                </span>

                {match(useValues())
                    .with(P.array(), () => children)
                    .otherwise(() => <ConstantInput className={"w-1/2"} addonAfter={"%"} />)}
            </div>
        }
    }
}

export const RxjsConstantOrTable = Rxjs<
    {
        sValues: Subject<number | number[]>,
        useValues: () => number | number[],
        sSwitch: Subject<boolean>,
        ConstantInput: React.FC<PropsWithChildren & NumberInputProps>,
        state$: StateObservable<boolean>
    },
    PropsWithChildren<{ title: string }>
>(() => {
    console.log("init");
    const sValues = new Subject<number | number[]>();
    const [useValues] = bind(sValues, []);
    const { component: ConstantInput } = numberInput("", "");
    const sSwitch = new Subject<boolean>();
    const state$ = state(of(true));
    return { sValues, useValues, ConstantInput, sSwitch, state$ }
}, ({ sValues, useValues, sSwitch, ConstantInput, title, children, state$ }) => {
    const values = useValues();

    return <div>
        <Title level={5}>{title}</Title>
        <span className={"flex flex-row items-center gap-2 pb-2"}>
            <p className={"text-md pb-1"}>Constant</p>
            <RxjsSwitch
                value$={state$}
                callback={sSwitch}
                checkedChildren={"Yes"}
                unCheckedChildren={"No"}
            />
        </span>

        {match(useValues())
            .with(P.array(), () => children)
            .otherwise(() => <ConstantInput className={"w-1/2"} addonAfter={"%"} />)}
    </div>
});
