import { Request, Response } from "express";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { PageResponse, CommandResponse, ActiveUser, MainMenuPageResponse } from "./typeDefinitions";
import { EmployeeClassification } from "./commands/models/constants/entityTypes/employeeClassification";
import { ViewNameLookup, RouteLookup, ErrorCodeLookup, QueryParameterLookup } from "./lookups/stringLookup";

export let start = (req: Request, res: Response) => {
	if (req.session == null) {
		res.redirect(RouteLookup.SignIn);
		return;
	}

	ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>) => {
			const isElevatedUser: boolean = (
				((<ActiveUser>activeUserCommandResponse.data).classification === EmployeeClassification.GeneralManager)
				|| ((<ActiveUser>activeUserCommandResponse.data).classification === EmployeeClassification.ShiftManager));

			res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store");
			res.render(ViewNameLookup.MainMenu,
				<MainMenuPageResponse>{
					isElevatedUser: isElevatedUser,
					errorMessage: (
						(req.query && req.query.errorCode && (req.query.errorCode !== ""))
							? ErrorCodeLookup[req.query.errorCode] : "")
				});
		}).catch((error: any) => {
			if ((error.status != null) && (error.status === 401)) {
				res.redirect(RouteLookup.SignIn + QueryParameterLookup.EC2603);
			} else {
				res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store");
				res.render(ViewNameLookup.MainMenu, <PageResponse>{ errorMessage: error.message });
			}
		});
};
