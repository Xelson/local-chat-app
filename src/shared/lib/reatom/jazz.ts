/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @stylistic/indent */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	co,
	type AccountSchema,
	type CoFeedSchema,
	type CoListSchema,
	type CoMapSchema,
	type FileStreamSchema,
	type PlainTextSchema,
} from 'jazz-tools';

import {
	Account,
	AnonymousJazzAgent,
	CoList,
	CoMap,
	CoPlainText,
	FileStream,
	type AccountInstance,
	type InstanceOrPrimitiveOfSchema,
	type InstanceOrPrimitiveOfSchemaCoValuesNullable,
} from 'jazz-tools/dist/internal.js';

import { createAtom, named, withConnectHook, wrap, type AtomLike, type Rec } from '@reatom/core';
import { z } from 'zod/v4';

type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type BuiltIns = Primitive | Date | RegExp;
export type PartialDeep<T> = T extends BuiltIns
	? T | undefined
	: T extends object
	? T extends ReadonlyArray<any>
	? T
	: {
		[K in keyof T]?: PartialDeep<T[K]>
	}
	: unknown;

// type CoRecordSchema<K extends z.core.$ZodString<string>, V extends z.core.$ZodType> = ReturnType<typeof co.record<K, V>>;
// type RichTextSchema = ReturnType<typeof co.richText>;

type SupportedSchema =
	| AccountSchema
	| CoListSchema<any>
	| CoMapSchema<any>
	// | CoFeedSchema<any>
	// | CoRecordSchema<any, any>
	| FileStreamSchema
	| PlainTextSchema
	// | RichTextSchema
	| z.core.$ZodType;

type EmptyObject = Record<string, never>;
type ReadonlyAtom<State> = AtomLike<State, []>;
type OnlyStringKeys<T> = Exclude<T, number | symbol>;
type DistributeIntersection<U, T> = U extends any ? U & T : never;

type JazzAtomization<T extends SupportedSchema, Union = never, Intersection = unknown> =
	// co primitives
	T extends CoMapSchema<infer Shape, infer Config>
	? ReadonlyAtom<{ [K in keyof Shape]: JazzAtomization<Shape[K], Union, Intersection> } | null | undefined> & {
		co: (Shape extends Record<string, never>
			? EmptyObject
			: {
				-readonly [key in keyof Shape]: InstanceOrPrimitiveOfSchema<
					Shape[key]
				>;
			}) &
		(unknown extends Config['out'][string]
			? EmptyObject
			: {
				[key: string]: Config['out'][string];
			}) &
		CoMap;
	}
	: T extends CoListSchema<infer Item>
	? ReadonlyAtom<JazzAtomization<Item, Union, Intersection>[] | null | undefined> & {
		co: CoList<InstanceOrPrimitiveOfSchema<Item>>;
	}
	: T extends AccountSchema<infer Shape>
	? JazzAtomization<Omit<CoMapSchema<Shape>, 'create' | 'load' | 'withMigration'>, Union, Intersection> & {
		co: AccountInstance<Shape>;
	}
	: T extends PlainTextSchema
	? ReadonlyAtom<(CoPlainText & Intersection) | Union | null | undefined>
	: T extends FileStreamSchema
	? ReadonlyAtom<(FileStream & Intersection) | Union>

	// zod primitives
	: T extends z.ZodAny
	? any
	: T extends z.core.$ZodBranded<infer T, infer Brand>
	? JazzAtomization<T, Union, z.core.$brand<Brand> & Intersection>
	: T extends z.core.$ZodUnknown
	? ReadonlyAtom<(unknown & Intersection) | Union>
	: T extends z.core.$ZodNever
	? never
	: T extends z.core.$ZodReadonly<infer Type>
	? ReadonlyAtom<(z.infer<Type> & Intersection) | Union>
	: T extends z.core.$ZodUndefined
	? ReadonlyAtom<(undefined & Intersection) | Union>
	: T extends z.core.$ZodVoid
	? ReadonlyAtom<(undefined & Intersection) | Union>
	: T extends z.core.$ZodNaN
	? ReadonlyAtom<(number & Intersection) | Union>
	: T extends z.core.$ZodNull
	? ReadonlyAtom<(null & Intersection) | Union>
	: T extends z.core.$ZodLiteral<infer T>
	? ReadonlyAtom<(T & Intersection) | Union>
	: T extends z.core.$ZodBoolean
	? ReadonlyAtom<(boolean & Intersection) | Union>
	: T extends z.core.$ZodNumber
	? ReadonlyAtom<(number & Intersection) | Union>
	: T extends z.core.$ZodBigInt
	? ReadonlyAtom<(bigint & Intersection) | Union>
	: T extends z.core.$ZodString
	? ReadonlyAtom<(string & Intersection) | Union>
	: T extends z.core.$ZodTemplateLiteral<infer Template>
	? ReadonlyAtom<(Template & Intersection) | Union>
	: T extends z.core.$ZodSymbol
	? ReadonlyAtom<(symbol & Intersection) | Union>
	: T extends z.core.$ZodDate
	? ReadonlyAtom<(Date & Intersection) | Union>
	: T extends z.core.$ZodArray<infer T>
	? ReadonlyAtom<JazzAtomization<T>>
	: T extends z.core.$ZodTuple<infer Tuple>
	? ReadonlyAtom<(z.infer<Tuple[number]> & Intersection) | Union>
	: T extends z.core.$ZodObject<infer Shape>
	? ReadonlyAtom<((EmptyObject extends Shape ? EmptyObject : {
		[K in keyof Shape]: JazzAtomization<Shape[K]>
	}) & Intersection) | Union>
	: T extends z.core.$ZodRecord<infer KeyType, infer ValueType>
	? ReadonlyAtom<(Record<z.infer<KeyType>, JazzAtomization<ValueType>> & Intersection) | Union>
	: T extends z.core.$ZodMap<infer KeyType, infer ValueType>
	? ReadonlyAtom<(Map<z.infer<KeyType>, JazzAtomization<ValueType>> & Intersection) | Union>
	: T extends z.core.$ZodSet<infer ValueType>
	? ReadonlyAtom<(Set<z.infer<ValueType>> & Intersection) | Union>
	: T extends z.core.$ZodEnum<infer Enum>
	? ReadonlyAtom<(OnlyStringKeys<keyof Enum> & Intersection) | Union>
	: T extends z.core.$ZodDefault<infer T>
	? JazzAtomization<T, Union extends undefined ? never : Union, Intersection>
	: T extends z.core.$ZodPrefault<infer T>
	? JazzAtomization<T, Union extends undefined ? never : Union, Intersection>
	: T extends z.core.$ZodTransform<infer Output, infer _Input>
	? ReadonlyAtom<(Output & Intersection) | Union>
	: T extends z.core.$ZodOptional<infer T>
	? JazzAtomization<T, undefined | Union, Intersection>
	: T extends z.core.$ZodCatch<infer T>
	? JazzAtomization<T, Union, Intersection>
	: T extends z.core.$ZodPipe<infer _T, infer Output>
	? JazzAtomization<Output>
	: T extends z.core.$ZodLazy<infer T>
	? JazzAtomization<T>
	: T extends z.core.$ZodNullable<infer T>
	? JazzAtomization<T, null | Union, Intersection>
	: T extends z.core.$ZodDiscriminatedUnion<infer T>
	? T extends Array<z.core.$ZodObject<infer Shape>>
	? ReadonlyAtom<{
		[K in keyof Shape]: JazzAtomization<Shape[K]>;
	}> : unknown
	: T extends z.core.$ZodFile
	? ReadonlyAtom<(File & Intersection) | Union>
	: T extends z.core.$ZodCustom<infer Output>
	? ReadonlyAtom<(Output & Intersection) | Union>
	: T extends z.ZodUnion<infer T>
	? ReadonlyAtom<DistributeIntersection<z.infer<T[number]>, Intersection> | Union>
	: T;

export const reatomJazz = <Schema extends SupportedSchema>(
	schema: Schema,
	{
		name = named('jazzModel'),
		initState,
		loadAs,
	}: {
		name?: string;
		loadAs: Account | AnonymousJazzAgent;
		initState: InstanceOrPrimitiveOfSchemaCoValuesNullable<Schema>;
	},
): JazzAtomization<Schema> => {
	let returnVal;

	const createObjectModel = (def: z.core.$ZodObjectDef) => {
		const obj = {} as Rec;
		for (const [key, child] of Object.entries(def.shape)) {
			obj[key] = reatomJazz(child as z.ZodFirstPartySchemaTypes, {
				initState: (initState as any)?.[key],
				name: `${name}.${key}`,
				loadAs,
			});
		}
		return obj as JazzAtomization<Schema>;
	};

	const createArrayModel = (def: z.core.$ZodArrayDef) => {
		return (initState as any[]).map(itemInitState => reatomJazz(def.element, {
			name: `${name}.item`,
			initState: itemInitState,
			loadAs,
		}));
	};

	if ('collaborative' in schema) {
		if ('builtin' in schema) {
			switch (schema.builtin) {
				case 'FileStream': {
					const _initState = initState as FileStream;

					returnVal = createAtom<FileStream>({ initState: _initState }, name).extend(
						withConnectHook(target => schema.subscribe(_initState.id, { loadAs }, wrap(target.set))),
					);
					break;
				}
				case 'CoPlainText': {
					const _initState = initState as CoPlainText;

					returnVal = createAtom<CoPlainText | null>({ initState: _initState }, name).extend(
						withConnectHook(target => schema.subscribe(_initState.id, { loadAs }, wrap(target.set))),
					);
					break;
				}
				case 'Account': {
					returnVal = Object.assign(createObjectModel(schema.def), { co: schema });
					break;
				}
			}
		}
		else {
			const def = schema._zod.def;
			switch (def.type) {
				case 'array': { // CoList
					const _schema = schema as CoList<any>;

					returnVal = createAtom({
						initState: createArrayModel(def),
					}, name).extend(
						() => ({ co: _schema }),
						withConnectHook(() => _schema.subscribe(_initState.id, { loadAs }, (payload) = {})),
					);
					break;
				}
				case 'object': { // CoMap
					returnVal = createAtom({ initState: createObjectModel(def.shape) }, name).extend(
						() => ({ co: schema }),
					);
					break;
				}
			}
		}
	}

	return returnVal;
};

const TestSchema = co.map({
	role: z.literal(['system', 'developer', 'user', 'assistant', 'tool']),
	content: co.plainText(),
	streaming: z.boolean(),
	get prev() { return TestSchema.optional(); },
});

const TestListSchema = co.list(TestSchema);

const schemaTest = reatomJazz(TestSchema, TestSchema.create({}));

const listSchemaTest = reatomJazz(TestListSchema, TestListSchema.create({}));
