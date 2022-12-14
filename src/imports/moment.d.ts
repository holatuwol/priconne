declare function moment(value?: string | number | null, strf?: string) : Moment

declare interface Moment {
	add: (amount: number, unit: string) => Moment
	format: (strf: string) => string
	isBefore: (Moment) => boolean
	valueOf: () => number
	toDate: () => Date
	utc: () => Moment
	year: () => number
}