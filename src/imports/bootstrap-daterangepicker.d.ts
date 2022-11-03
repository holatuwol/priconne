interface BootstrapDateRangePicker {
	startDate: Moment
}

type JQuery<BootstrapDateRangePicker> = JQuery<HTMLInputElement> & {
	daterangepicker: Function
}