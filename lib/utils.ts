import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}

export class TokenList implements Pick<DOMTokenList, 'length' | 'add' | 'toString'> {
	private tokens: Set<string>

	constructor(...parts: (string | undefined)[]) {
		this.tokens = new Set(
			Iterator.from(parts)
				.filter(Boolean)
				.flatMap((s) => s!.split(/\s+/g))
				.filter(Boolean),
		)
	}

	get length(): number {
		return this.tokens.size
	}

	add(value: string) {
		this.tokens.add(value)
	}

	toString(): string {
		return [...this.tokens].join(' ')
	}
}
