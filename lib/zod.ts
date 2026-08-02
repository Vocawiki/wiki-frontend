import * as z from 'zod'

export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: (isoString) => new Date(isoString),
	encode: (date) => date.toISOString(),
})

export const isoDatetimeToInstant = z.codec(z.iso.datetime(), z.instanceof(Temporal.Instant), {
	decode: (isoString) => Temporal.Instant.from(isoString),
	encode: (instant) => instant.toString(),
})
