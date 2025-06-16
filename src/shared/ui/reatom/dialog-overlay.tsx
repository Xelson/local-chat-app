import { action, atom, reatomBoolean, type Action, wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import type { ComponentType } from 'react';

type CmpPropsType = Record<string, unknown> | undefined;
type RequestArgsType = CmpPropsType | undefined;

type FactoryApi<RequestArgs extends RequestArgsType, Result> = {
	requestOpen: undefined extends RequestArgs
		? Action<[], Promise<Result | null>>
		: Action<[args: RequestArgs], Promise<Result | null>>;
	requestClose: Action<[args: Result | null], void>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Fix<T> = undefined extends T ? {} : T;

type Factory<CmpProps extends CmpPropsType, RequestArgs extends RequestArgsType, Result>
	= (api: FactoryApi<RequestArgs, Result>) => ComponentType<Fix<CmpProps> & Fix<RequestArgs> & {
		controller: {
			open: boolean;
			onOpenChange: (details: boolean | { open: boolean }) => void;
			onExitComplete?: () => void;
		};
	}>;

export const reatomControllablePopup = <
	CmpProps extends CmpPropsType = undefined,
	RequestArgs extends RequestArgsType = undefined,
	Result = void,
>(
	init: Factory<CmpProps, RequestArgs, Result>,
	name: string,
) => {
	type Api = FactoryApi<RequestArgs, Result>;

	const open = reatomBoolean(false, `${name}.open`);
	const requestArgs = atom<RequestArgs | null>(null, `${name}.requestArgs`);
	const promiseResolver = atom<((result: Result | null) => void) | null>(null, `${name}.promiseResolver`);
	const waitForExitPromise = atom<Promise<unknown>>(Promise.resolve(), `${name}.waitForExitPromise`);
	const waitForExitResolver = atom<(() => void) | null>(null, `${name}.waitForExitResolver`);

	const requestOpen = action(async (args: RequestArgs) => {
		promiseResolver()?.(null);
		waitForExitResolver()?.();

		waitForExitPromise.set(new Promise(r => waitForExitResolver.set(() => r)));

		requestArgs.set(args);
		open.setTrue();
		return new Promise<Result | null>((resolve) => {
			promiseResolver.set(() => resolve);
		});
	}, `${name}.requestOpen`) as Api['requestOpen'];

	const requestClose = action((result: Result | null) => {
		const resolve = promiseResolver();
		resolve?.(result);
		open.setFalse();
	}, `${name}.requestClose`);

	const Component = init({ requestOpen, requestClose });

	// @ts-expect-error idk i have no time for it
	const Viewport = reatomComponent<CmpProps>((props) => {
		const args = requestArgs();
		const close = wrap(requestClose);

		if (args === null)
			return null;

		return (
			<Component
				controller={{
					open: open(),
					onOpenChange: (e) => {
						const status = typeof e === 'boolean' ? e : e.open;
						if (!status)
							close(null);
					},
					onExitComplete: waitForExitResolver() ?? undefined,
				}}
				{...Object(props)}
				{...args ?? {}}
			/>
		);
	}, `${name}.Viewport`);

	return {
		open,
		requestOpen,
		requestClose,
		waitForExit: waitForExitPromise,
		Viewport,
	};
};
