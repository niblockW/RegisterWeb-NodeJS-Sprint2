import { Request, Response } from "express";
import * as EmployeeSignIn from "./commands/employees/employeeSignInCommand";
import * as EmployeeExistsQuery from "./commands/employees/employeeExistsQuery";
import * as ClearActiveUser from "./commands/activeUsers/clearActiveUserCommand";
import { PageResponse, CommandResponse, ApiResponse, SignInPageResponse } from "./typeDefinitions";
import { ViewNameLookup, RouteLookup, QueryParameterLookup, ErrorCodeLookup, ParameterLookup } from "./lookups/stringLookup";

export let start = (req: Request, res: Response) => {
	EmployeeExistsQuery.query()
		.then((employeeExistsCommandResponse: CommandResponse<void>) => {
			if (employeeExistsCommandResponse.status === 200) {
				res.render(ViewNameLookup.SignIn,
					<SignInPageResponse>{
						employeeId: req.query[ParameterLookup.EmployeeId],
						errorMessage: (
							(req.query && req.query.errorCode && (req.query.errorCode !== ""))
								? ErrorCodeLookup[req.query.errorCode] : "")
					});
			} else {
				res.redirect(ViewNameLookup.EmployeeDetail);
			}
		}).catch((error: any) => {
			res.render(ViewNameLookup.SignIn,
				<PageResponse>{
					errorMessage: (error.message || ErrorCodeLookup.EC2401)
				});
		});
};

export let signIn = (req: Request, res: Response) => {
	EmployeeSignIn.execute(req.body, req.session)
		.then(() => {
			res.redirect(RouteLookup.MainMenu);
		}).catch((error: any) => {
			console.error("An error occurred when attempting to perform employee sign in. " + error.message);
			res.redirect(RouteLookup.SignIn + QueryParameterLookup.EC2203);
		});
};

export let clearActiveUser = (req: Request, res: Response) => {
	if (req.session == null) {
		res.status(204)
			.send(<ApiResponse>{ redirectUrl: RouteLookup.SignIn });
	}

	ClearActiveUser.removeBySessionKey((<Express.Session>req.session).id)
		.then((removeCommandResponse: CommandResponse<void>) => {
			res.status(removeCommandResponse.status)
				.send(<ApiResponse>{ redirectUrl: RouteLookup.SignIn });
		}).catch((error: any) => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: error.message,
					redirectUrl: RouteLookup.SignIn
				});
		});
};
