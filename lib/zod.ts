import 'temporal-polyfill/global'

import * as z from 'zod'

export const isoDatetimeToInstant = z.codec(z.iso.datetime(), z.instanceof(Temporal.Instant), {
	decode: (isoString) => Temporal.Instant.from(isoString),
	encode: (instant) => instant.toString(),
})
