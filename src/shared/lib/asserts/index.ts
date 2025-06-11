export function invariant(
	predicate: unknown,
	errorMessage: Error | string = 'Assertion Failed',
): asserts predicate {
	if (!predicate) {
		throw typeof errorMessage === 'string'
			? new Error(errorMessage)
			: errorMessage;
	}
}

export function requireString(value: unknown, errorMessage = 'Value is not a string') {
	invariant(typeof value === 'string', errorMessage);
	return value;
}
