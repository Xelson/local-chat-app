import React, {
	type PropsWithChildren,
	createContext,
	useContext as useReactContext,
} from 'react';

interface CreateContextOptions<Data> {
	errorMessage?: string;
	defaultValue?: Data;
}

type CreateContextReturn<Data, Name extends string, Key extends string = Capitalize<Name>> =
	Record<`use${Key}Context`, () => Data | undefined>
	& Record<`use${Key}ContextOrProp`, (prop?: Data) => Data>
	& Record<`use${Key}StrictContext`, () => Data>
	& Record<`${Key}Provider`, React.Provider<Data>>
	& Record<`${Key}Consumer`, React.Consumer<Data>>;

function capitalize<T extends string>(str: T) {
	return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>;
}

export function createContextFactory<Name extends string>(name: Name) {
	return function create<Data>(options: CreateContextOptions<Data> = {}) {
		const {
			errorMessage,
			defaultValue = undefined,
		} = options;

		const context = createContext<Data | undefined>(defaultValue);
		const capitilizeName = capitalize(name);

		context.displayName = `${capitilizeName}Context`;

		const hookName = `use${capitilizeName}Context` as const;
		const hookOrPropName = `use${capitilizeName}ContextOrProp` as const;
		const strictHookName = `use${capitilizeName}StrictContext` as const;
		const providerName = `${capitilizeName}Provider` as const;
		const consumerName = `${capitilizeName}Consumer` as const;

		function useStrictContext() {
			const value = useReactContext(context);
			if (value === undefined) {
				const error = new Error(errorMessage ?? (
					`${strictHookName} returned \`undefined\`. Seems you forgot\
					to wrap component within ${providerName}`
				));
				error.name = 'ContextError';
				Error.captureStackTrace?.(error, useStrictContext);
				throw error;
			}
			return value;
		}

		function useContextOrProp(prop?: Data) {
			const contextValue = useReactContext(context);
			const value = prop ?? contextValue;

			if (value === undefined) {
				const error = new Error(errorMessage ?? (
					`${hookOrPropName} returned \`undefined\`. Seems you forgot\
					to wrap component within ${providerName} or to value pass prop`
				));
				error.name = 'ContextOrPropError';
				Error.captureStackTrace?.(error, useContextOrProp);
				throw error;
			}
			return value;
		}

		// Fix for usage inside server components
		function Provider({ children, value }: PropsWithChildren & { value: Data }) {
			return (
				<context.Provider value={value}>
					{children}
				</context.Provider>
			);
		}

		return {
			[providerName]: Provider,
			[consumerName]: context.Consumer,
			[hookName]: () => useReactContext(context),
			[hookOrPropName]: useContextOrProp,
			[strictHookName]: useStrictContext,
		} as CreateContextReturn<Data, Name>;
	};
}
