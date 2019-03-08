$(document).on("click", "#productsListing li", productClick);

function productClick(event) {
	let $listItem = $(event.target);

	if (!$listItem.is("li")) {
		$listItem = $listItem.parent("li");
	}

	window.location.assign(
		"/productDetail/"
		+ $listItem
			.children("input[name='productId'][type='hidden']")
			.val());
}
