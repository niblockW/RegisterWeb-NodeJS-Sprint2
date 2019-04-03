$(document).ready(() => {
	$("input[name='employeeId'][type='number']").focus().select();
});

function validateForm() {
	const employeeId = $("input[name='employeeId'][type='number']").val();
	if (!employeeId || (employeeId.trim() === "") || isNaN(+employeeId)) {
		displayError("Please provide a valid employee ID.");
		$("input[name='employeeId'][type='number']").focus().select();
		return false;
	}

	const password = $("input[name='password'][type='password']").val();
	if (!password || (password.trim() === "")) {
		displayError("Please provide a valid password.");
		$("input[name='password'][type='password']").focus().select();
		return false;
	}

	return true;
}
