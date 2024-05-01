import Title from "antd/es/typography/Title"
import switchComp from "./Switch";
import { map, type Observable } from "rxjs";
import { bind } from "@react-rxjs/core";
import numberInput from "./InputNumber";
import type { PropsWithChildren } from "react";
import { P, match } from "ts-pattern";

export type ConstantOrTableProps = {
    title: string;
};

export default function constantOrTable<T>(
    values$: Observable<T[] | T>,
) {
    const [useValues] = bind(values$, [] as T[]);

    const { component: ConstantSwitch, onChange$: switchChange$ } = switchComp(values$.pipe(
        map((values) => match(values)
            .with(P.array(), () => false)
            .otherwise(() => true)
        ))
    );
    const { component: ConstantInput } = numberInput("", "");

    switchChange$.subscribe()

    return {
        toggleConstant$: switchChange$,
        component: function ConstantOrTable({
            title,
            children
        }: PropsWithChildren<ConstantOrTableProps>) {
            return <div>
                <Title level={5}>{title}</Title>
                <span className={"flex flex-row items-center gap-2 pb-2"}>
                    <p className={"text-md pb-1"}>Constant</p>
                    <ConstantSwitch checkedChildren={"Yes"} unCheckedChildren={"No"} />
                </span>

                {match(useValues())
                    .with(P.array(), () => children)
                    .otherwise(() => <ConstantInput className={"w-1/2"} addonAfter={"%"} />)}
            </div>
        }
    }
}
