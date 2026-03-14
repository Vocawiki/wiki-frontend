/**
 * https://github.com/sindresorhus/ts-extras/blob/99cd0d434a94c6527ccf0c0489d8dbebc857b691/source/safe-cast-to.ts
 * MIT License
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 */

/**
Constrain a value to the given type safely.

Unlike `as`, this refuses incompatible casts at compile time. Use it to _narrow_ or _shape_ values while preserving type safety.

@example
```
type Foo = {
	a: string;
	b?: number;
};

declare const possibleUndefined: Foo | undefined;

const foo = possibleUndefined ?? safeCastTo<Partial<Foo>>({});
console.log(foo.a ?? '', foo.b ?? 0);

const bar = possibleUndefined ?? {};
// @ts-expect-error
console.log(bar.a ?? '', bar.b ?? 0);
//             ^^^ Property 'a' does not exist on type '{}'.(2339)
//                          ^^^ Property 'b' does not exist on type '{}'.(2339)
```

@category General
*/
export function safeCastTo<T>(value: T): T {
	return value
}
