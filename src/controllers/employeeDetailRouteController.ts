import Bluebird from "bluebird";
import { Request, Response } from "express";
import * as Helper from "./commands/helpers/helper";
import * as EmployeeQuery from "./commands/employees/employeeQuery";
import * as EmployeeExistsQuery from "./commands/employees/employeeExistsQuery";
import * as EmployeeCreateCommand from "./commands/employees/employeeCreateCommand";
import * as EmployeeUpdateCommand from "./commands/employees/employeeUpdateCommand";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { ViewNameLookup, ParameterLookup, ErrorCodeLookup, RouteLookup, QueryParameterLookup } from "./lookups/stringLookup";
import { EmployeeClassification, EmployeeClassificationLabel } from "./commands/models/constants/entityTypes/employeeClassification";
import { CommandResponse, ApiResponse, Employee, EmployeeDetailPageResponse, EmployeeSaveRequest, EmployeeSaveResponse, EmployeeType, ActiveUser } from "./typeDefinitions";

const buildEmployeeTypes = (): EmployeeType[] => {
	const employeeTypes: EmployeeType[] = [];

	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.NotDefined,
		label: EmployeeClassificationLabel.NotDefined
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.Cashier,
		label: EmployeeClassificationLabel.Cashier
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.ShiftManager,
		label: EmployeeClassificationLabel.ShiftManager
	});
	employeeTypes.push(<EmployeeType>{
		value: EmployeeClassification.GeneralManager,
		label: EmployeeClassificationLabel.GeneralManager
	});

	return employeeTypes;
};

const buildEmptyEmployee = (): Employee => {
	return <Employee>{
		id: "",
		lastName: "",
		active: false,
		firstName: "",
		employeeId: "",
		managerId: Helper.EmptyUUID,
		classification: EmployeeClassification.NotDefined
	};
};

const processStartEmployeeDetailError = (error: any, res: Response) => {
	if (error.status && (error.status === 401)) {
		res.redirect(RouteLookup.SignIn + QueryParameterLookup.EC2603);
	} else {
		res.status((error.status || 500))
		.render(
			ViewNameLookup.EmployeeDetail,
			<EmployeeDetailPageResponse>{
				employee: buildEmptyEmployee(),
				employeeTypes: buildEmployeeTypes(),
				errorMessage: (error.message || ErrorCodeLookup.EC2202)
			});
}
};

const determineCanCreateEmployee = (req: Request): Bluebird<boolean> => {
	let employeeExists: boolean;

	return EmployeeExistsQuery.query()
		.then((employeeExistsCommandResponse: CommandResponse<void>): Bluebird<CommandResponse<ActiveUser>> => {
			employeeExists = (employeeExistsCommandResponse.status === 200);

			if (employeeExists) {
				if (req.session != null) {
					return ValidateActiveUser.execute((<Express.Session>req.session).id);
				} else {
					return Bluebird.resolve(<CommandResponse<ActiveUser>>{ status: 404 });
				}
			} else {
				return Bluebird.resolve(<CommandResponse<ActiveUser>>{ status: 200 });
			}
		}).then((activeUserCommandResponse: CommandResponse<ActiveUser>): Bluebird<boolean> => {
			return Bluebird.resolve(!employeeExists
				|| ((activeUserCommandResponse.status === 200)
				&& (((<ActiveUser>activeUserCommandResponse.data).classification === EmployeeClassification.GeneralManager)
				|| ((<ActiveUser>activeUserCommandResponse.data).classification === EmployeeClassification.ShiftManager))));
		});
};

export let start = (req: Request, res: Response) => {
	if ((req.params[ParameterLookup.EmployeeId] == null)
		|| (req.params[ParameterLookup.EmployeeId].trim() === "")) {

		determineCanCreateEmployee(req)
			.then((canCreateEmployee: boolean) => {
				if (canCreateEmployee) {
					res.render(
						ViewNameLookup.EmployeeDetail,
						<EmployeeDetailPageResponse>{
							employee: buildEmptyEmployee(),
							employeeTypes: buildEmployeeTypes(),
							errorMessage: (
								(req.query && req.query.errorCode && (req.query.errorCode !== ""))
									? ErrorCodeLookup[req.query.errorCode] : "")
						});
				} else {
					res.redirect(RouteLookup.MainMenu + QueryParameterLookup.EC2605);
				}
			}).catch((error: any) => {
				processStartEmployeeDetailError(error, res);
			});
	} else {
		ValidateActiveUser.execute((<Express.Session>req.session).id)
			.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Bluebird<CommandResponse<Employee>> => {
				if (((<ActiveUser>activeUserCommandResponse.data).classification !== EmployeeClassification.GeneralManager)
					&& ((<ActiveUser>activeUserCommandResponse.data).classification !== EmployeeClassification.ShiftManager)) {


					return Bluebird.reject(<CommandResponse<Employee>>{
						status: 401,
						message: ErrorCodeLookup.EC2605
					});
				}

				return EmployeeQuery.queryById(req.params[ParameterLookup.EmployeeId]);
			}).then((employeeCommandResponse: CommandResponse<Employee>) => {
				res.render(
					ViewNameLookup.EmployeeDetail,
					<EmployeeDetailPageResponse>{
						employeeTypes: buildEmployeeTypes(),
						employee: employeeCommandResponse.data,
						errorMessage: (
							(req.query && req.query.errorCode && (req.query.errorCode !== ""))
								? ErrorCodeLookup[req.query.errorCode] : "")
					});
			}).catch((error: any) => {
				processStartEmployeeDetailError(error, res);
			});
	}
};

const saveEmployee = (performSave: (employeeSaveRequest: EmployeeSaveRequest) => Bluebird<CommandResponse<Employee>>,
	req: Request,
	res: Response): void => {

	let employeeExists: boolean;

	if (req.session == null) {
		res.status(401)
			.send(<ApiResponse>{
				redirectUrl: RouteLookup.SignIn,
				errorMessage: ErrorCodeLookup.EC2601
			});

		return;
	}

	determineCanCreateEmployee(req)
		.then((canCreateEmployee: boolean): Bluebird<CommandResponse<void>> => {
			if (!canCreateEmployee) {
				return Bluebird.reject(<CommandResponse<void>>{
					status: 401,
					message: ErrorCodeLookup.EC2605
				});
			}

			return EmployeeExistsQuery.query();
		}).then((employeeExistsCommandResponse: CommandResponse<void>): Bluebird<CommandResponse<Employee>> => {
			employeeExists = (employeeExistsCommandResponse.status === 200);

			return performSave(req.body);
		}).then((saveEmployeeCommandResponse: CommandResponse<Employee>): void => {
			res.status(saveEmployeeCommandResponse.status)
				.send(<EmployeeSaveResponse>{
					employee: <Employee>saveEmployeeCommandResponse.data,
					redirectUrl: (employeeExists ?
						RouteLookup.MainMenu :
						(RouteLookup.SignIn + QueryParameterLookup.EmployeeId + (<Employee>saveEmployeeCommandResponse.data).employeeId))
				});
		}).catch((error: any): void => {
			res.status((error.status || 500))
				.send(<ApiResponse>{
					errorMessage: (error.message || ErrorCodeLookup.EC1202)
				});
		});
};

export let updateEmployee = (req: Request, res: Response) => {
	saveEmployee(EmployeeUpdateCommand.execute, req, res);
};

export let createEmployee = (req: Request, res: Response) => {
	saveEmployee(EmployeeCreateCommand.execute, req, res);
};
