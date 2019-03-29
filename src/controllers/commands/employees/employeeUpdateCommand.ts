import Bluebird from "bluebird";
import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { EmployeeInstance } from "../models/entities/employeeEntity";
import * as EmployeeRepository from "../models/repositories/employeeRepository";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";
import { EmployeeClassification } from "../models/constants/entityTypes/employeeClassification";

const buildUpdateObject = (employeeSaveRequest: EmployeeSaveRequest): Object => {
	const updateObject: any = {};

	if (employeeSaveRequest.active != null) {
		updateObject.active = employeeSaveRequest.active;
	}
	if (employeeSaveRequest.lastName != null) {
		updateObject.lastName = employeeSaveRequest.lastName;
	}
	if (employeeSaveRequest.firstName != null) {
		updateObject.firstName = employeeSaveRequest.firstName;
	}
	if ((employeeSaveRequest.password != null) && (employeeSaveRequest.password.trim() !== "")) {
		updateObject.password = Buffer.from(EmployeeHelper.hashString(employeeSaveRequest.password));
	}
	if (employeeSaveRequest.classification != null) {
		updateObject.classification = <EmployeeClassification>employeeSaveRequest.classification;
	}
	if ((employeeSaveRequest.managerId != null) && Helper.isValidUUID(employeeSaveRequest.managerId)) {
		updateObject.managerId = employeeSaveRequest.managerId;
	}

	return updateObject;
};

const validateSaveRequest = (employeeSaveRequest: EmployeeSaveRequest): CommandResponse<Employee> => {
	const validationResponse: CommandResponse<Employee> =
		<CommandResponse<Employee>>{ status: 200 };

	if ((employeeSaveRequest.firstName != null) && (employeeSaveRequest.firstName.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2227;
	} else if ((employeeSaveRequest.lastName != null) && (employeeSaveRequest.lastName.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2228;
	} else if ((employeeSaveRequest.password != null) && (employeeSaveRequest.password.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2229;
	} else if ((employeeSaveRequest.classification != null)
		&& (isNaN(employeeSaveRequest.classification)
		|| !(employeeSaveRequest.classification in EmployeeClassification))) {

		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2230;
	} else if ((employeeSaveRequest.managerId != null) && !Helper.isValidUUID(employeeSaveRequest.managerId)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2231;
	}

	return validationResponse;
};

export let execute = (employeeSaveRequest: EmployeeSaveRequest): Bluebird<CommandResponse<Employee>> => {
	const validationResponse: CommandResponse<Employee> = validateSaveRequest(employeeSaveRequest);
	if (validationResponse.status !== 200) {
		return Bluebird.reject(validationResponse);
	}

	let updateTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Bluebird<EmployeeInstance | null> => {
			updateTransaction = startedTransaction;

			return EmployeeRepository.queryById(<string>employeeSaveRequest.id, updateTransaction);
		}).then((queriedEmployee: (EmployeeInstance | null)): Bluebird<EmployeeInstance> => {
			if (queriedEmployee == null) {
				return Bluebird.reject(<CommandResponse<Employee>>{
					status: 404,
					message: ErrorCodeLookup.EC1201
				});
			}

			return queriedEmployee.update(
				buildUpdateObject(employeeSaveRequest),
				<Sequelize.InstanceUpdateOptions>{ transaction: updateTransaction });
		}).then((updatedEmployee: EmployeeInstance): Bluebird<CommandResponse<Employee>> => {
			updateTransaction.commit();

			return Bluebird.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(updatedEmployee)
			});
		}).catch((error: any): Bluebird<CommandResponse<Employee>> => {
			if (updateTransaction != null) {
				updateTransaction.rollback();
			}

			return Bluebird.reject(<CommandResponse<Employee>>{
				status: (error.status || 500),
				message: (error.messsage || ErrorCodeLookup.EC1202)
			});
		});
};
