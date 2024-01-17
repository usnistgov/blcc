import button, { ButtonType } from "./Button";
import { PropsWithChildren } from "react";
import { startWith } from "rxjs/operators";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronLeft } from "@mdi/js";
import { scan } from "rxjs";
import { bind } from "@react-rxjs/core";

type CollapseProps = {
    title: string;
    icon?: string;
};

export default function collapse() {
    const { click$, component: Button } = button();
    const [opened] = bind(
        click$.pipe(
            scan((accumulator) => !accumulator, false),
            startWith(false)
        )
    );

    return {
        component: function Collapse({ title, icon, children }: PropsWithChildren<CollapseProps>) {
            const open = opened();

            return (
                <>
                    <Button type={ButtonType.PRIMARY} icon={icon}>
                        <div className={"w-full flex justify-between items-center"}>
                            {title}
                            <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={0.8} />
                        </div>
                    </Button>
                    <div className={"flex flex-col pl-8 gap2"}>{open && children}</div>
                </>
            );
        }
    };
}
