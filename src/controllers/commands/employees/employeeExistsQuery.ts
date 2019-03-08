import Bluebird from "bluebird";
import { CommandResponse } from "../../typeDefinitions";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { EmployeeInstance } from "../models/entities/employeeEntity";
import * as EmployeeRepository from "../models/repositories/employeeRepository";

export let query = (): Bluebird<CommandResponse<void>> => {
	return EmployeeRepository.queryActiveExists()
		.then((existingEmployee: (EmployeeInstance | null)): Bluebird<CommandResponse<void>> => {
			if (!existingEmployee) {
				return Bluebird.resolve(<CommandResponse<void>>{
					status: 404,
					message: ErrorCodeLookup.EC1201
				});
			}

			return Bluebird.resolve(<CommandResponse<void>>{ status: 200 });
		});
};
