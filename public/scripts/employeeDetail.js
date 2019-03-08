let hideEmployeeSavedAlertTimer = undefined;

// Save
$(document).on("click", "#saveButton", () => {
	if (!validateSave()) {
		return;
	}

	const employeeId = getEmployeeId();
	const employeeIdIsDefined = (employeeId && (employeeId.trim() !== ""));
	const saveActionUrl = ("/api/employeeDetail/"
		+ (employeeIdIsDefined ? employeeId : ""));
	const saveEmployeeRequest = {
		id: employeeId,
		lastName: getEmployeeLastName(),
		password: getEmployeePassword(),
		firstName: getEmployeeFirstName(),
		managerId: getEmployeeManagerId(),
		classification: getEmployeeType()
	};

	if (employeeIdIsDefined) {
		ajaxPut(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			if (callbackResponse
				&& callbackResponse.status
				&& (callbackResponse.status >= 200)
				&& (callbackResponse.status < 300)) {

				navigateAfterSave(callbackResponse);
			}
		});
	} else {
		ajaxPost(saveActionUrl, saveEmployeeRequest, (callbackResponse) => {
			if (callbackResponse
				&& callbackResponse.status
				&& (callbackResponse.status >= 200)
				&& (callbackResponse.status < 300)) {

				navigateAfterSave(callbackResponse);
			}
		});
	}
});

function validateSave() {
	const firstName = getEmployeeFirstName();
	if (!firstName || (firstName.trim() === "")) {
		displayError("Please provide a valid employee first name.");
		$("input[name='employeeFirstName'][type='text']").focus().select();
		return false;
	}

	const lastName = getEmployeeLastName();
	if (!lastName || (lastName.trim() === "")) {
		displayError("Please provide a valid employee last name.");
		$("input[name='employeeLastName'][type='text']").focus().select();
		return false;
	}

	const password = getEmployeePassword();
	if (!password || (password.trim() === "")) {
		displayError("Please provide a valid employee password.");
		$("input[name='employeePassword'][type='password']").focus().select();
		return false;
	}

	const verifyPassword = getEmployeeVerifyPassword();
	if (password !== verifyPassword) {
		displayError("Passwords do not match.");
		$("input[name='employeePassword'][type='password']").focus().select();
		return false;
	}

	const employeeType = getEmployeeType();
	if (!employeeType || (employeeType <= 0)) {
		displayError("Please provide a valid employee Type.");
		$("select[name='employeeType']").focus();
		return false;
	}

	return true;
}

function navigateAfterSave(callbackResponse) {
	if (callbackResponse.data
		&& callbackResponse.data.redirectUrl
		&& (callbackResponse.data.redirectUrl !== "")) {

		window.location.replace(callbackResponse.data.redirectUrl);
	} else {
		window.location.replace("/mainMenu");
	}
}
// End save

// Getters
function getEmployeeId() {
	return $("input[name='employeeId'][type='hidden']").val();
}
function setEmployeeId(employeeId) {
	$("input[name='employeeId'][type='hidden']").val(employeeId);
}

function getEmployeeManagerId() {
	return $("input[name='employeeManagerId'][type='hidden']").val();
}

function getEmployeeEmployeeId() {
	return $("input[name='employeeEmployeeId'][type='text']").val();
}

function getEmployeeFirstName() {
	return $("input[name='employeeFirstName'][type='text']").val();
}

function getEmployeeLastName() {
	return $("input[name='employeeLastName'][type='text']").val();
}

function getEmployeePassword() {
	return $("input[name='employeePassword'][type='password']").val();
}

function getEmployeeVerifyPassword() {
	return $("input[name='employeeVerifyPassword'][type='password']").val();
}

function getEmployeeType() {
	return $("select[name='employeeType']").val();
}
// End getters