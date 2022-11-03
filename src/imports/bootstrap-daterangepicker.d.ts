interface BootstrapDateRangePicker {
	endDate: Moment
	startDate: Moment
}

type JQuery<BootstrapDateRangePicker> = JQuery<HTMLInputElement> & {
	daterangepicker: Function
}