// AJAX
function ajaxGet(resourceRelativeUri, callback) {
	return ajax(resourceRelativeUri, "GET", null, callback);
}

function ajaxPut(resourceRelativeUri, data, callback) {
	return ajax(resourceRelativeUri, "PUT", data, callback);
}

function ajaxPost(resourceRelativeUri, data, callback) {
	return ajax(resourceRelativeUri, "POST", data, callback);
}

function ajaxDelete(resourceRelativeUri, callback) {
	return ajax(resourceRelativeUri, "DELETE", null, callback);
}

function ajax(resourceRelativeUri, verb, data, callback) {
	const httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		return httpRequest;
	}

	httpRequest.onreadystatechange = () => {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if ((httpRequest.status >= 200) && (httpRequest.status < 300)) {
				handleSuccessResponse(httpRequest, callback);
			} else {
				handleFailureResponse(httpRequest, callback);
			}
		}
	};

	httpRequest.open(verb, resourceRelativeUri, true);
	if (data) {
		httpRequest.setRequestHeader('Content-Type', 'application/json');
		httpRequest.send(JSON.stringify(data));
	} else {
		httpRequest.send();
	}

	return httpRequest;
}

function handleSuccessResponse(httpRequest, callback) {
	clearError();

	if (callback) {
		let callbackResponse = { status: httpRequest.status };

		if (httpRequest.responseText && (httpRequest.responseText !== "")) {
			let responseObject = JSON.parse(httpRequest.responseText);
			if (responseObject) {
				callbackResponse.data = responseObject;
			}
		}

		callback(callbackResponse);
	}
}

function handleFailureResponse(httpRequest, callback) {
	if (!httpRequest || (httpRequest.status === 0)) {
		return;
	}

	let errorMessage = "Unable to complete the requested action.";

	if (httpRequest.responseText && (httpRequest.responseText !== "")) {
		let responseObject = JSON.parse(httpRequest.responseText);

		if (responseObject && responseObject.redirectUrl && (responseObject.redirectUrl !== "")) {
			if (callback) {
				callback({ status: httpRequest.status });
			}
			window.location.assign(responseObject.redirectUrl);

			return;
		}

		if (responseObject && responseObject.errorMessage && (responseObject.errorMessage !== "")) {
			errorMessage = responseObject.errorMessage;
		}
	}

	displayError(errorMessage);

	if (callback) {
		callback({ status: httpRequest.status });
	}
}
// End AJAX

// Display error message
function clearError() {
	let errorMessageDisplayDiv = $("#error");

	if (!errorMessageDisplayDiv || errorMessageDisplayDiv.hasClass("hidden")) {
		return;
	}

	errorMessageDisplayDiv.addClass("hidden");
}

function displayError(errorMessage) {
	if (!errorMessage || (errorMessage === "")) {
		return;
	}

	let errorMessageDisplayDiv = $("#error");
	let errorMessageDisplayHeader = $("#errorMessage");

	if (!errorMessageDisplayDiv || !errorMessageDisplayHeader) {
		return;
	}

	errorMessageDisplayHeader.text(errorMessage);
	if (errorMessageDisplayDiv.hasClass("hidden")) {
		errorMessageDisplayDiv.removeClass("hidden");
	}
}
// End display error message

// Sign out
$(document).on("click", "#signOutImage", () => {
	window.location.replace("/");

	ajaxDelete("/api/signOut", (callbackResponse) => {
		if (callbackResponse.data
			&& callbackResponse.data.redirectUrl
			&& (callbackResponse.data.redirectUrl !== "")) {
	
			window.location.replace(callbackResponse.data.redirectUrl);
		} else {
			window.location.replace("/");
		}
	});
});
// End sign out