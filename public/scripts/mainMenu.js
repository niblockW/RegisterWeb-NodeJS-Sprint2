$(document).on("click", "#startTransactionButton", () => {
	window.location.assign("/transaction")
});

$(document).on("click", "#viewProductsButton", () => {
	window.location.assign("/productListing")
});

$(document).on("click", "#createEmployeeButton", () => {
	window.location.assign("/employeeDetail")
});

$(document).on("click", "#productSalesReportButton", () => {
	displayError("Functionality has not been implemented yet.");
});

$(document).on("click", "#cashierSalesReportButton", () => {
	displayError("Functionality has not been implemented yet.");
});
