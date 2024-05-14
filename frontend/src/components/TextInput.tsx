import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, Typography } from "antd";
import type { PropsWithChildren } from "react";
import { EMPTY, type Observable, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";

export enum TextInputType {
    PRIMARY = " ",
    ERROR = " border-solid border-2 border-red-600 active:border-red-600 hover:border-red-600 ",
    SUCCESS = " border-solid border-2 border-green-600 active:border-green-600 hover:border-green-600 ",
    DISABLED = " bg-base-lighter text-base-light ",
}

export type TextInputProps = {
    className?: string;
    type: TextInputType;
    disabled?: boolean;
    placeholder?: string;
    bordered?: boolean;
    label?: string;
};

export type TextInput = {
    onChange$: Observable<string>;
    component: React.FC<PropsWithChildren & TextInputProps>;
};

const { Title } = Typography;

export default function textInput(value$: Observable<string | undefined> = EMPTY): TextInput {
    const [onChange$, onChange] = createSignal<string>();
    const [focused$, focus] = createSignal<boolean>();

    const [useValue] = bind(
        focused$.pipe(
            startWith(false),
            switchMap((focused) => (focused ? onChange$ : value$)),
        ),
        undefined,
    );

    return {
        onChange$,
        component: ({
            children,
            className,
            type,
            disabled = false,
            bordered = true,
            placeholder,
            label,
        }: PropsWithChildren & TextInputProps) => {
            return (
                <div>
                    <Title level={5}>{label}</Title>
                    <Input
                        onFocus={() => focus(true)}
                        onBlur={() => focus(false)}
                        className={`${className ?? ""} ${disabled ? TextInputType.DISABLED : type}`}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        variant={bordered ? "outlined" : "borderless"}
                        disabled={disabled}
                        value={useValue()}
                    >
                        {children}
                    </Input>
                </div>
            );
        },
    };
}

type TextInputProps2 = {
    label: string;
};

export function TextInput({ label, children }: PropsWithChildren<TextInputProps2>) {
    return (
        <div>
            <Title level={5}>{label}</Title>
            <Input
                onFocus={() => focus(true)}
                onBlur={() => focus(false)}
                className={(className ?? "") + `${disabled ? TextInputType.DISABLED : type}`}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                variant={bordered ? "outlined" : "borderless"}
                disabled={disabled}
                value={useValue()}
            >
                {children}
            </Input>
        </div>
    );
}
