import { Button, ButtonType } from "./Button";
import type { PropsWithChildren } from "react";
import { startWith } from "rxjs/operators";
import { scan, Subject } from "rxjs";
import { bind } from "@react-rxjs/core";

type CollapseProps = {
    title: string;
    icon?: string;
    buttonType?: ButtonType;
};

export default function collapse() {
    const click$ = new Subject<void>();
    const [opened] = bind(
        click$.pipe(
            scan((accumulator) => !accumulator, false),
            startWith(false)
        )
    );

    return {
        component: function Collapse({
            title,
            icon,
            buttonType = ButtonType.PRIMARY,
            children
        }: PropsWithChildren<CollapseProps>) {
            const open = true; //opened();

            return (
                <>
                    <Button type={buttonType} icon={icon} onClick={() => click$.next()}>
                        <div className={"flex w-full items-center justify-between"}>
                            {title}
                            {/*<Icon path={open ? mdiChevronDown : mdiChevronLeft} size={0.8} />*/}
                        </div>
                    </Button>
                    <div className={"flex flex-col gap-2 pl-8"}>{open && children}</div>
                </>
            );
        }
    };
}
