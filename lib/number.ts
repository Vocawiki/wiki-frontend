const numberFormatter = new Intl.NumberFormat('en', {
	style: 'decimal',
	useGrouping: 'min2',
})

export function formatNumber(n: number): string {
	return numberFormatter.format(n)
}

export function formatNumberOrNaN(n: number, forNaN: string = '?'): string {
	return Number.isNaN(n) ? forNaN : numberFormatter.format(n)
}
