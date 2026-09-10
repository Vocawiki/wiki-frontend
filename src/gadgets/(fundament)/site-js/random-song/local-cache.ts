interface CacheItem<T> {
	value: T
	expiry: number
}

export class LocalCache {
	/**
	 * 存储带过期时间的数据
	 * @param key 缓存键
	 * @param value 要缓存的值（必须可 JSON 序列化）
	 * @param ttlMs 过期时间（毫秒）
	 */
	static set<T>(key: string, value: T, ttlMs: number): void {
		const item: CacheItem<T> = {
			value,
			expiry: Date.now() + ttlMs,
		}
		try {
			localStorage.setItem(key, JSON.stringify(item))
		} catch (error) {
			console.warn(`Failed to set cache item "${key}" in localStorage:`, error)
		}
	}

	/**
	 * 获取缓存数据（自动检查是否过期）
	 * @param key 缓存键
	 * @returns 缓存的值，若不存在或已过期则返回 null
	 */
	static get<T>(key: string): T | null {
		const itemStr = localStorage.getItem(key)
		if (!itemStr) return null

		try {
			const item = JSON.parse(itemStr) as CacheItem<T>
			if (Date.now() > item.expiry) {
				// 已过期，清理并返回 null
				localStorage.removeItem(key)
				return null
			}
			return item.value
		} catch (error) {
			// 解析失败（如数据损坏），清理并返回 null
			console.warn(`Corrupted cache data for key "${key}", clearing it.`, error)
			localStorage.removeItem(key)
			return null
		}
	}

	/**
	 * 删除指定缓存项
	 */
	static remove(key: string): void {
		localStorage.removeItem(key)
	}
}
