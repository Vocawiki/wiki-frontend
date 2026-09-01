import { unique } from 'radashi'
import type { Ref } from 'vue'

import type { Chip } from './types'

export function stripCategory(title: string) {
	return title.replace(/^Category:/, '')
}

export function stripAuthorCategory(title: string) {
	return title.replace(/^Category:作者:/, '')
}

function trimUnicodeWhitespace(s: string): string {
	return s.replace(/^\s+|\s+$/gu, '')
}

export function trimChip(c: Chip): void {
	c.value = trimUnicodeWhitespace(c.value)
	if (typeof c.label === 'string') {
		c.label = trimUnicodeWhitespace(c.label)
	}
}

export function dedupChips(chips: Chip[]): Chip[] {
	const filtered = unique(chips, (c) => c.value)
	return filtered.length === chips.length ? chips : filtered
}

/** 把输入框内容作为chip提交：去重后追加到chips与selected，并清空输入。 */
export function commitChip(input: Ref<string>, chips: Ref<Chip[]>, selected: Ref<string[]>): void {
	const v = String(input.value || '').trim()
	if (!v) return

	if (!chips.value.some((c) => String(c?.value ?? c) === v)) {
		chips.value.push({ value: v, label: v })
		selected.value.push(v)
	}
	input.value = ''
}

/** 捕获阶段拦截回车：无高亮菜单项时把输入内容直接添加为chip。 */
export function lookupEnterHandler(commit: () => void) {
	return (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return

		const input = e.target as HTMLInputElement | null
		if (input?.getAttribute('aria-activedescendant')) {
			return
		}
		e.preventDefault()
		commit()
	}
}

/** 格式化字节数 */
export function formatBytes(n: number) {
	if (!n) {
		return '0 B'
	}
	const units = ['B', 'KiB', 'MiB', 'GiB']
	let i = 0
	let v = n
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024
		i++
	}
	return (i === 0 ? v : v.toFixed(v >= 10 ? 0 : 1)) + ' ' + units[i]
}

/** 转义模板参数 */
export function escapeTemplateParam(s: string) {
	return s.replace(/\|/g, '{{!}}').replace(/=/g, '{{=}}')
}

function notify(message: string, options?: mw.notification.NotificationOptions) {
	if (typeof mw.notify !== 'function') {
		console.warn('mw.notify不可用，回退到console.log')
		console.log(message, options)
		return
	}
	mw.notify(message, options)
}
export function notifyError(msg: string) {
	return notify(msg, { type: 'error', autoHideSeconds: 'long' })
}
export function notifySuccess(msg: string) {
	return notify(msg, { type: 'success', autoHideSeconds: 'short' })
}
