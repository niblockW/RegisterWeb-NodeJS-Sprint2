import Bluebird from "bluebird";
import * as Helper from "../helpers/helper";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as EmployeeRepository from "../models/repositories/employeeRepository";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";
import { EmployeeInstance, EmployeeAttributes } from "../models/entities/employeeEntity";
import { EmployeeClassification } from "../models/constants/entityTypes/employeeClassification";

const validateSaveRequest = (employeeSaveRequest: EmployeeSaveRequest): CommandResponse<Employee> => {
	const validationResponse: CommandResponse<Employee> =
		<CommandResponse<Employee>>{ status: 200 };

	if ((employeeSaveRequest.firstName == null) || (employeeSaveRequest.firstName.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2227;
	} else if ((employeeSaveRequest.lastName == null) || (employeeSaveRequest.lastName.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2228;
	} else if ((employeeSaveRequest.password == null) || (employeeSaveRequest.password.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2229;
	} else if ((employeeSaveRequest.classification == null)
		|| isNaN(employeeSaveRequest.classification)
		|| !(employeeSaveRequest.classification in EmployeeClassification)) {

		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2230;
	} else if ((employeeSaveRequest.managerId != null)
		&& (employeeSaveRequest.managerId.trim() !== "")
		&& !Helper.isValidUUID(employeeSaveRequest.managerId)) {
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

	const employeeToCreate: EmployeeAttributes = <EmployeeAttributes>{
		active: true,
		lastName: employeeSaveRequest.lastName,
		firstName: employeeSaveRequest.firstName,
		managerId: employeeSaveRequest.managerId,
		classification: <EmployeeClassification>employeeSaveRequest.classification,
		password: Buffer.from(EmployeeHelper.hashString(employeeSaveRequest.password))
	};

	return EmployeeRepository.create(employeeToCreate)
		.then((createdEmployee: EmployeeInstance): Bluebird<CommandResponse<Employee>> => {
			return Bluebird.resolve(<CommandResponse<Employee>>{
				status: 201,
				data: EmployeeHelper.mapEmployeeData(createdEmployee)
			});
		});
};
