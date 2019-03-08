import Bluebird from "bluebird";
import { Request, Response } from "express";
import * as ProductQuery from "./commands/products/productQuery";
import * as ProductCreateCommand from "./commands/products/productCreateCommand";
import * as ProductDeleteCommand from "./commands/products/productDeleteCommand";
import * as ProductUpdateCommand from "./commands/products/productUpdateCommand";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { EmployeeClassification } from "./commands/models/constants/entityTypes/employeeClassification";
import { ViewNameLookup, ParameterLookup, ErrorCodeLookup, RouteLookup, QueryParameterLookup } from "./lookups/stringLookup";
import { CommandResponse, Product, ProductDetailPageResponse, ApiResponse, ProductSaveResponse, ProductSaveRequest, ActiveUser } from "./typeDefinitions";

const processStartProductDetailError = (error: any, res: Response) => {
	if (error.status && (error.status === 401)) {
		res.redirect(RouteLookup.SignIn + QueryParameterLookup.EC2603);
	} else {
		let errorMessage: (string | undefined) = "";
		if (error.status && (error.status >= 500)) {
			errorMessage = error.message;
		}

		res.status((error.status || 500))
			.render(
				ViewNameLookup.ProductDetail,
				<ProductDetailPageResponse>{
					product: <Product>{
						id: "",
						count: 0,
						lookupCode: ""
					},
					errorMessage: errorMessage
				});
	}
};

export let start = (req: Request, res: Response) => {
	if (req.session == null) {
		res.redirect(RouteLookup.SignIn);
		return;
	}

	let currentUser: ActiveUser;

	ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Bluebird<CommandResponse<Product>> => {
			currentUser = <ActiveUser>activeUserCommandResponse.data;

			return ProductQuery.queryById(req.params[ParameterLookup.ProductId]);
		}).then((productsCommandResponse: CommandResponse<Product>) => {
			res.render(
				ViewNameLookup.ProductDetail,
				<ProductDetailPageResponse>{
					product: productsCommandResponse.data,
					isElevatedUser: ((currentUser.classification === EmployeeClassification.GeneralManager)
						|| (currentUser.classification === EmployeeClassification.ShiftManager))
				});
		}).catch((error: any) => {
			processStartProductDetailError(error, res);
		});
};

const saveProduct = (productSaveRequest: ProductSaveRequest,
	performSave: (productSaveRequest: ProductSaveRequest) => Bluebird<CommandResponse<Product>>,
	req: Request,
	res: Response): void => {

	if (req.session == null) {
		res.status(401)
			.send(<ApiResponse>{
				redirectUrl: RouteLookup.SignIn,
				errorMessage: ErrorCodeLookup.EC2601
			});

		return;
	}

	ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Bluebird<CommandResponse<Product>> => {
			const currentUserRole: EmployeeClassification = (<ActiveUser>activeUserCommandResponse.data).classification;
			if ((currentUserRole !== EmployeeClassification.GeneralManager)
				&& (currentUserRole !== EmployeeClassification.ShiftManager)) {

				return Bluebird.reject(<CommandResponse<Product>>{
					status: 401,
					message: ErrorCodeLookup.EC2605
				});
			}

			return performSave(productSaveRequest);
		}).then((createProductCommandResponse: CommandResponse<Product>): void => {
			res.status(createProductCommandResponse.status)
				.send(<ProductSaveResponse>{
					product: <Product>createProductCommandResponse.data
				});
		}).catch((error: any): void => {
			res.status((error.status || 500))
				.send(<ApiResponse>{
					errorMessage: (error.message || ErrorCodeLookup.EC1002)
				});
		});
};

export let updateProduct = (req: Request, res: Response) => {
	saveProduct(req.body, ProductUpdateCommand.execute, req, res);
};

export let createProduct = (req: Request, res: Response) => {
	saveProduct(req.body, ProductCreateCommand.execute, req, res);
};

export let deleteProduct = (req: Request, res: Response) => {
	if (req.session == null) {
		res.status(401)
			.send(<ApiResponse>{
				redirectUrl: RouteLookup.SignIn,
				errorMessage: ErrorCodeLookup.EC2601
			});

		return;
	}

	ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Bluebird<CommandResponse<void>> => {
			const currentUserRole: EmployeeClassification = (<ActiveUser>activeUserCommandResponse.data).classification;
			if ((currentUserRole !== EmployeeClassification.GeneralManager)
				&& (currentUserRole !== EmployeeClassification.ShiftManager)) {

				return Bluebird.reject(<CommandResponse<void>>{
					status: 401,
					message: ErrorCodeLookup.EC2605
				});
			}

			return ProductDeleteCommand.execute(req.params[ParameterLookup.ProductId]);
		}).then((deleteProductCommandResponse: CommandResponse<void>): void => {
			res.status(deleteProductCommandResponse.status)
				.send(<ApiResponse>{});
		}).catch((error: any): void => {
			res.status((error.status || 500))
				.send(<ApiResponse>{
					errorMessage: (error.message || ErrorCodeLookup.EC1002)
				});
		});
};
