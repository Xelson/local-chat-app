export type Either<Data, Error> = { data: Data; error: null } | { data: null; error: Error };

export const err = <const T>(error: T) => ({ data: null, error });
export const ok = <const T>(data: T) => ({ data, error: null });
export const uncertain = { data: null, error: null };
