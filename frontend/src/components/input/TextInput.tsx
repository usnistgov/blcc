import { type StateObservable, bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, type InputProps } from "antd";
import Title from "antd/es/typography/Title";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { type Observable, type Subject, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";

export enum TextInputType {
	PRIMARY = " ",
	ERROR = " border-solid border-2 border-red-600 active:border-red-600 hover:border-red-600 ",
	SUCCESS = " border-solid border-2 border-green-600 active:border-green-600 hover:border-green-600 ",
	DISABLED = " bg-base-lighter text-base-light ",
}

type TextInputProps = {
	label?: string;
	className?: string;
	type: TextInputType;
	value$?: Observable<string | undefined>;
	wire: Subject<string | undefined>;
};

export default function TextInput({
	label,
	children,
	value$,
	wire,
	className,
	disabled,
	type,
	...defaultProps
}: PropsWithChildren<TextInputProps & InputProps>) {
	const { useValue, focus, onChange, onChange$ } = useMemo(() => {
		const [onChange$, onChange] = createSignal<string | undefined>();
		const [focused$, focus] = createSignal<boolean>();

		const [useValue] = bind(
			focused$.pipe(
				startWith(false),
				switchMap((focused) => (focused ? onChange$ : value$ ? value$ : wire)),
			),
			undefined,
		);

		return { useValue, focus, onChange, onChange$ };
	}, [value$, wire]);

	useEffect(() => {
		const sub = onChange$.subscribe(wire);
		return () => sub.unsubscribe();
	}, [wire, onChange$]);

	return (
		<div>
			{label && <Title level={5}>{label}</Title>}
			<Input
				onFocus={() => focus(true)}
				onBlur={() => focus(false)}
				className={`${className ?? ""} ${
					disabled ? TextInputType.DISABLED : type
				}`}
				onChange={(event) => onChange(event.currentTarget.value)}
				value={useValue()}
				{...defaultProps}
			>
				{children}
			</Input>
		</div>
	);
}
