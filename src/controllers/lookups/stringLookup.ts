export enum ParameterLookup {
	ProductId = "productId",
	EmployeeId = "employeeId"
}

export enum ViewNameLookup {
	SignIn = "signIn",
	MainMenu = "mainMenu",
	ProductDetail = "productDetail",
	EmployeeDetail = "employeeDetail",
	ProductListing = "productListing",
	Transaction = "transaction"
}

export enum RouteLookup {
	// Page routing
	SignIn = "/",
	SignOut = "/signOut",
	MainMenu = "/mainMenu",
	ProductDetail = "/productDetail",
	EmployeeDetail = "/employeeDetail",
	ProductListing = "/productListing",
	Transaction = "transaction",

	// Page routing - parameters
	ProductIdParameter = "/:productId",
	EmployeeIdParameter = "/:employeeId",

	// MIGHT NEED TO ADD SOMETHING FOR TRANSACTION

	// End page routing - parameters
	// End page routing

	// API routing
	API = "/api",
	// End API routing
}

// Error codes
export enum ErrorCodeLookup {
	// Database
	// Database - product
	EC1001 = "Product was not found.",
	EC1002 = "Unable to save product.",
	EC1003 = "Unable to delete product.",
	// End database - product

	// Database - employee
	EC1201 = "Employee was not found.",
	EC1202 = "Unable to save employee.",
	EC1203 = "Unable to delete employee.",
	// End database - employee
	// End database

	// General
	// General - product
	EC2001 = "Unable to retrieve product listing.",
	EC2025 = "The provided product record ID is not valid.",
	EC2026 = "Please provide a valid product lookup code.",
	EC2027 = "Please provide a valid product count.",
	EC2028 = "Product count may not be negative.",
	EC2029 = "Conflict on parameter: lookupcode.",
	// End general - product

	// General - employee
	EC2201 = "Unable to retrieve employee listing.",
	EC2202 = "Unable to retrieve employee details.",
	EC2203 = "Unable to sign in employee.",
	EC2225 = "The provided employee record ID is not valid.",
	EC2226 = "Please provide a valid employee ID.",
	EC2227 = "Please provide a valid first name.",
	EC2228 = "Please provide a valid last name.",
	EC2229 = "Please provide a valid password.",
	EC2230 = "Please provide a valid cashier type.",
	EC2231 = "Please provide a valid manager ID.",
	EC2251 = "Sign in credentials are invalid.",
	// End general - employee

	// General - sign in
	EC2401 = "An issue was encountered while checking the database for existing employees.",
	// End general - sign in

	// General - session
	EC2601 = "An active session was not found.",
	EC2602 = "An active user record was not found for the provided sesion details. Please sign in again.",
	EC2603 = "The current user's session is no longer active.",
	EC2604 = "Unable to sign out user.",
	EC2605 = "You do not have permission to perform this action."
	// End general - session
	// End general
}
// End error codes

export enum QueryParameterLookup {
	EmployeeId = "?employeeId=",

	// Error codes
	EC2203 = "?errorCode=EC2203", // Unable to sign in employee
	EC2603 = "?errorCode=EC2603", // Session is no longer active
	EC2605 = "?errorCode=EC2605" // You do not have permission
	// End error codes
}
// End error codes
