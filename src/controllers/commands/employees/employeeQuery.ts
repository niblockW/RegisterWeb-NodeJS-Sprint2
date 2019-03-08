import Bluebird from "bluebird";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, Employee } from "../../typeDefinitions";
import { EmployeeInstance } from "../models/entities/employeeEntity";
import * as EmployeeRepository from "../models/repositories/employeeRepository";

export let queryById = (recordId?: string): Bluebird<CommandResponse<Employee>> => {
	if (!recordId || (recordId.trim() === "")) {
		return Bluebird.reject(<CommandResponse<Employee>>{
			status: 422,
			message: ErrorCodeLookup.EC2225
		});
	}

	return EmployeeRepository.queryById(recordId)
		.then((existingEmployee: (EmployeeInstance | null)): Bluebird<CommandResponse<Employee>> => {
			if (!existingEmployee) {
				return Bluebird.reject(<CommandResponse<Employee>>{
					status: 404,
					message: ErrorCodeLookup.EC1201
				});
			}

			return Bluebird.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(existingEmployee)
			});
		});
};

export let queryByEmployeeId = (employeeId?: string): Bluebird<CommandResponse<Employee>> => {
	if (!employeeId || (employeeId.trim() === "") || isNaN(+employeeId)) {
		return Bluebird.reject(<CommandResponse<Employee>>{
			status: 422,
			message: ErrorCodeLookup.EC2226
		});
	}

	return EmployeeRepository.queryByEmployeeId(+employeeId)
		.then((existingEmployee: (EmployeeInstance | null)): Bluebird<CommandResponse<Employee>> => {
			if (!existingEmployee) {
				return Bluebird.reject(<CommandResponse<Employee>>{
					status: 404,
					message: ErrorCodeLookup.EC1201
				});
			}

			return Bluebird.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(existingEmployee)
			});
		});
};
