import Bluebird from "bluebird";
import { Request, Response } from "express";
import * as ProductsQuery from "./commands/products/productsQuery";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { CommandResponse, Product, ProductListingPageResponse } from "./typeDefinitions";
import { ViewNameLookup, ErrorCodeLookup, RouteLookup, QueryParameterLookup } from "./lookups/stringLookup";

const processStartProductListingError = (error: any, res: Response) => {
	if (error.status && (error.status === 401)) {
		res.redirect(RouteLookup.SignIn + QueryParameterLookup.EC2603);
	} else {
		res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store");
		res.status((error.status || 500))
			.render(
				ViewNameLookup.ProductListing,
				<ProductListingPageResponse>{
					products: [],
					errorMessage: (error.message || ErrorCodeLookup.EC2001)
				});
	}
};

export let start = (req: Request, res: Response) => {
	if (req.session == null) {
		res.redirect(RouteLookup.SignIn);
		return;
	}

	ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((): Bluebird<CommandResponse<Product[]>> => {
			return ProductsQuery.query();
		}).then((productsCommandResponse: CommandResponse<Product[]>) => {
			res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store");
			res.render(
				ViewNameLookup.ProductListing,
				<ProductListingPageResponse>{
					products: productsCommandResponse.data
				});
		}).catch((error: any) => {
			processStartProductListingError(error, res);
		});
};
