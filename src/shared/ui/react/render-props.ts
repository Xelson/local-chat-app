export type RenderProp<P> = ((props: P) => React.ReactNode);
export type MaybeRenderProp<P> = React.ReactNode | RenderProp<P>;
export type PropsWithMaybeRenderProp<Props extends object, Api>
	= Omit<Props, 'children'> & {
		children?: MaybeRenderProp<Api>;
	};

export function transformRenderProps<T, U>(
	valueOrFn: T | ((...fnArgs: U[]) => T),
	...args: U[]
): T {
	return valueOrFn instanceof Function ? valueOrFn(...args) : valueOrFn;
}
