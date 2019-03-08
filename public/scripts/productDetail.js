let hideProductSavedAlertTimer = undefined;

// Save
$(document).on("click", "#saveButton", () => {
	if (!validateSave()) {
		return;
	}

	const productId = getProductId();
	const productIdIsDefined = (productId && (productId.trim() !== ""));
	const saveActionUrl = ("/api/productDetail/"
		+ (productIdIsDefined ? productId : ""));
	const saveProductRequest = {
		id: productId,
		count: getProductCount(),
		lookupCode: getProductLookupCode()
	};

	if (productIdIsDefined) {
		ajaxPut(saveActionUrl, saveProductRequest, (callbackResponse) => {
			if (callbackResponse
				&& callbackResponse.status
				&& (callbackResponse.status >= 200)
				&& (callbackResponse.status < 300)) {

				displayProductSavedAlertModal();
			}
		});
	} else {
		ajaxPost(saveActionUrl, saveProductRequest, (callbackResponse) => {
			if (callbackResponse
				&& callbackResponse.status
				&& (callbackResponse.status >= 200)
				&& (callbackResponse.status < 300)) {

				displayProductSavedAlertModal();

				if (callbackResponse.data
					&& callbackResponse.data.product
					&& callbackResponse.data.product.id
					&& (callbackResponse.data.product.id.trim() !== "")) {

					$("#deleteActionContainer").removeClass("hidden");

					setProductId(callbackResponse.data.product.id.trim());
				}
			}
		});
	}
});

function validateSave() {
	const lookupCode = getProductLookupCode();
	if (!lookupCode || (lookupCode.trim() === "")) {
		displayError("Please provide a valid product lookup code.");
		return false;
	}

	const count = getProductCount();
	if (!count || isNaN(count)) {
		displayError("Please provide a valid product count.");
		return false;
	} else if (count < 0) {
		displayError("Product count may not be negative.");
		return false;
	}

	return true;
}

function displayProductSavedAlertModal() {
	if (hideProductSavedAlertTimer) {
		clearTimeout(hideProductSavedAlertTimer);
	}

	$("#productSavedAlertModal").css("display", "none");
	$("#productSavedAlertModal").css("display", "block");

	hideProductSavedAlertTimer = setTimeout(hideProductSavedAlertModal, 1200);
}

function hideProductSavedAlertModal() {
	if (hideProductSavedAlertTimer) {
		clearTimeout(hideProductSavedAlertTimer);
	}

	$("#productSavedAlertModal").css("display", "none");
}
// End save

// Delete
$(document).on("click", "#deleteButton", () => {
	const deleteActionUrl = ("/api/productDetail/" + getProductId());

	ajaxDelete(deleteActionUrl, (callbackResponse) => {
		if (callbackResponse
			&& callbackResponse.status
			&& (callbackResponse.status >= 200)
			&& (callbackResponse.status < 300)) {

			window.location.replace("/productListing");
		}
	});
});
// End delete

// Getters
function getProductId() {
	return $("input[name='productId'][type='hidden']").val();
}
function setProductId(productId) {
	$("input[name='productId'][type='hidden']").val(productId);
}

function getProductLookupCode() {
	return $("input[name='productLookupCode'][type='text']").val();
}

function getProductCount() {
	return +$("input[name='productCount'][type='number']").val();
}
// End getters