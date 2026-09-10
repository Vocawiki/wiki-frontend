export {}

declare global {
	interface Window {
		RLQ?: [string | string[], () => unknown][]
	}
}
