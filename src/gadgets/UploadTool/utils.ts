import type { Ref } from 'vue'

import type { Chip } from './types'

export const chunk = <T>(arr: T[], size: number): T[][] => {
	const out: T[][] = []
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size))
	}
	return out
}

export const stripCategory = (title: string) => title.replace(/^Category:/, '')

export const stripAuthorCategory = (title: string) => title.replace(/^Category:作者:/, '')

export const trimChip = (c: Chip): void => {
	const clean = (s: string): string => s.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
	c.value = clean(c.value)
	if (typeof c.label === 'string') {
		c.label = clean(c.label)
	}
}

export const dedupChips = <T extends { value: string }>(chips: T[]): T[] => {
	const filtered = chips.filter((c, i, arr) => arr.findIndex((x) => x.value === c.value) === i)
	return filtered.length === chips.length ? chips : filtered
}

/** 把输入框内容作为chip提交：去重后追加到chips与selected，并清空输入。 */
export function commitChip(input: Ref<string>, chips: Ref<Chip[]>, selected: Ref<string[]>): void {
	const v = String(input.value || '').trim()
	if (!v) {
		return
	}
	if (!chips.value.some((c) => String(c?.value ?? c) === v)) {
		chips.value.push({ value: v, label: v })
		selected.value.push(v)
	}
	input.value = ''
}

/** 捕获阶段拦截回车：无高亮菜单项时把输入内容直接添加为chip。 */
export function lookupEnterHandler(commit: () => void) {
	return (e: KeyboardEvent) => {
		if (e.key !== 'Enter') {
			return
		}
		const input = e.target as HTMLInputElement | null
		if (input?.getAttribute('aria-activedescendant')) {
			return
		}
		e.preventDefault()
		commit()
	}
}

/** 格式化字节数 */
export const formatBytes = (n: number) => {
	if (!n) {
		return '0 B'
	}
	const units = ['B', 'KB', 'MB', 'GB']
	let i = 0
	let v = n
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024
		i++
	}
	return (i === 0 ? v : v.toFixed(v >= 10 ? 0 : 1)) + ' ' + units[i]
}

/** 转义模板参数 */
export const escapeTemplateParam = (s: string) => s.replace(/\|/g, '{{!}}').replace(/=/g, '{{=}}')

const notify = (message: string, options?: mw.notification.NotificationOptions) => {
	if (typeof mw.notify === 'function') {
		mw.notify(message, options)
	}
}

export const notifyError = (msg: string) => notify(msg, { type: 'error', autoHideSeconds: 'long' })
export const notifySuccess = (msg: string) => notify(msg, { type: 'success', autoHideSeconds: 'short' })
