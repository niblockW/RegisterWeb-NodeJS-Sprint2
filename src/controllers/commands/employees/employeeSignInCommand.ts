import Bluebird from "bluebird";
import Sequelize from "sequelize";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { EmployeeInstance } from "../models/entities/employeeEntity";
import * as EmployeeRepository from "../models/repositories/employeeRepository";
import * as ActiveUserRepository from "../models/repositories/activeUserRepository";
import { CommandResponse, Employee, SignInRequest, ActiveUser } from "../../typeDefinitions";
import { ActiveUserAttributes, ActiveUserInstance } from "../models/entities/activeUserEntity";

const validateSaveRequest = (signInRequest: SignInRequest): CommandResponse<Employee> => {
	let validationResponse: CommandResponse<Employee>;

	if ((signInRequest.employeeId == null)
		|| (signInRequest.employeeId.trim() === "")
		|| isNaN(+signInRequest.employeeId)
		|| (signInRequest.password == null)
		|| (signInRequest.password.trim() === "")) {

		validationResponse = <CommandResponse<Employee>>{
			status: 422,
			message: ErrorCodeLookup.EC2251
		};
	} else {
		validationResponse = <CommandResponse<Employee>>{ status: 200 };
	}

	return validationResponse;
};

const upsertActiveUser = (activeUser: ActiveUserAttributes): Bluebird<ActiveUserInstance> => {
	let upsertTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((newTransaction: Sequelize.Transaction): Bluebird<ActiveUserInstance | null> => {
			upsertTransaction = newTransaction;

			return ActiveUserRepository.queryByEmployeeId(activeUser.employeeId, upsertTransaction);
		}).then((existingActiveUser: (ActiveUserInstance | null)): Bluebird<ActiveUserInstance> => {
			if (existingActiveUser) {
				return existingActiveUser.update(
					<Object>{ sessionKey: activeUser.sessionKey },
					<Sequelize.InstanceUpdateOptions>{ transaction: upsertTransaction });
			} else {
				return ActiveUserRepository.create(activeUser, upsertTransaction);
			}
		}).then((activeUserInstance: ActiveUserInstance): Bluebird<ActiveUserInstance> => {
			upsertTransaction.commit();

			return Bluebird.resolve(activeUserInstance);
		}).catch((error: any): Bluebird<ActiveUserInstance> => {
			upsertTransaction.rollback();

			return Bluebird.reject(<CommandResponse<void>>{
				status: 500,
				message: error.message
			});
		});
};

export let execute = (signInRequest: SignInRequest, session?: Express.Session): Bluebird<CommandResponse<ActiveUser>> => {
	if (session == null) {
		return Bluebird.reject(<CommandResponse<ActiveUser>>{
			status: 500,
			message: ErrorCodeLookup.EC2601
		});
	}

	const validationResponse: CommandResponse<Employee> = validateSaveRequest(signInRequest);
	if (validationResponse.status !== 200) {
		return Bluebird.reject(validationResponse);
	}

	return EmployeeRepository.queryByEmployeeId(+signInRequest.employeeId)
		.then((existingEmployee: (EmployeeInstance | null)): Bluebird<ActiveUserInstance> => {
			if (!existingEmployee ||
				(EmployeeHelper.hashString(signInRequest.password) !== existingEmployee.password.toString())) {

				return Bluebird.reject(<CommandResponse<ActiveUser>>{
					status: 401,
					message: ErrorCodeLookup.EC2251
				});
			}

			return upsertActiveUser(<ActiveUserAttributes>{
				employeeId: existingEmployee.id,
				sessionKey: (<Express.Session>session).id,
				classification: existingEmployee.classification,
				name: (existingEmployee.firstName + " " + existingEmployee.lastName)
			});
		}).then((activeUser: ActiveUserInstance): Bluebird<CommandResponse<ActiveUser>> => {
			return Bluebird.resolve(<CommandResponse<ActiveUser>>{
				status: 200,
				data: <ActiveUser>{
					id: activeUser.id,
					name: activeUser.name,
					employeeId: activeUser.employeeId,
					classification: activeUser.classification
				}
			});
		});
};
