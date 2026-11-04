/** One semantic project covers the representations used by the compiler's
 * own IR and frontend context types, including recursive placeholders. */
export const typeMapperInput = `
export type Text = string;
export type NumberValue = number;
export type Flag = boolean;
export type Big = bigint;
export type Token = symbol;
export type Empty = undefined;
export type Nil = null;
export type Nothing = void;
export type NeverValue = never;
export type AnyValue = any;
export type UnknownValue = unknown;
export type TextLiteral = "text";
export type NumberLiteral = -2.5;
export type BooleanLiteral = false;
export type TextLiterals = "constructor" | "__proto__" | "";
export type NumberLiterals = 0 | 1 | -2.5;
export type MixedLiterals = "1" | 1 | false;
export type BroadValues = string | number | boolean | null | undefined;
export type TextArray = string[];
export type ReadonlyArrayValue = readonly number[];
export type NestedArray = (number | string)[][];
export type Tuple = readonly [string, number, boolean];
export type OptionalTuple = [string, number?];
export type RestTuple = [string, ...number[]];
export type StringMap = Map<string, number>;
export type ReadonlyMapValue = ReadonlyMap<string, number>;
export type StringSet = Set<string>;
export type OptionalMap = Map<string, number> | undefined;
export type OptionalSet = Set<string> | null;
export type Bytes = Uint8Array;
export type FloatBytes = Float64Array;
export type RegularExpression = RegExp;
export type Clock = Date;
export type Future = Promise<string>;
export type FutureVoid = Promise<void>;
export type Iterate = Generator<number, string, boolean>;
export type IterateVoid = Generator<number, void, unknown>;
export type AsyncIterate = AsyncGenerator<string, void, unknown>;
export type Call = (value: number, label: string) => boolean;
export type OptionalCall = ((value: number) => string) | undefined;
export type RecordValue = { name: string; count: number; enabled: boolean };
export type OptionalRecord = { name: string; count?: number };
export type Dictionary = { [name: string]: number };
export type CallableRecord = { name: string; callback: (value: number) => string };
export type Accessors = { get value(): number; set value(next: number) };
export type ReadonlyRecord = Readonly<RecordValue>;
export type PartialRecord = Partial<RecordValue>;
export type PickRecord = Pick<RecordValue, "name" | "count">;
export type OmitRecord = Omit<RecordValue, "enabled">;
export type IntersectionRecord = { left: number } & { right: string };
export interface Linked { value: number; next?: Linked }
export type LinkedRecord = Linked;
export interface Parent { name: string; child?: Child }
export interface Child { value: number; parent?: Parent }
export type MutualRecord = Parent;
export type Expression =
  | { kind: "number"; value: number }
  | { kind: "binary"; left: Expression; right: Expression }
  | { kind: "logical"; left: Expression; right: Expression };
export type OptionalExpression = Expression | undefined;
export type NullableExpression = Expression | null | undefined;
export type RefinedExpression = Expression & { source: { file: string; start: number } };
export type RecursiveArray = Expression[];
export type NumericVariant = { kind: 0; left: string } | { kind: -2.5; right: number };
export type BooleanVariant = { kind: false; left: string } | { kind: true; right: number };
export type MixedVariant = { kind: "1"; text: string } | { kind: 1; number: number } | { kind: false; flag: boolean };
export type AliasedVariant = { kind: "a" | "b"; value: number } | { kind: "c"; text: string };
export type OtherVariant = { kind: "x" | "y"; value: number } | { kind: "z"; text: string };
export type PlainUnion = { a: number } | { b: string };
export type OptionalKind = { kind?: "a"; a: number } | { kind: "b"; b: string };
export type AccessorKind = { get kind(): "a"; a: number } | { kind: "b"; b: string };
export type BroadKind = { kind: string; a: number } | { kind: "b"; b: string };
export class Named { value = 1 }
export type ClassInstance = Named;
export type ClassValue = typeof Named;
export class Box<T> { constructor(public value: T) {} }
export type HookGeneric = Box<number>;
export type HookParameter<T> = T;
export type HookIndexed<T, K extends keyof T> = T[K];
export type HookKeys<T> = T[keyof T];
export type HookLiteral<T extends { value: unknown }> = T["value"];
`;
