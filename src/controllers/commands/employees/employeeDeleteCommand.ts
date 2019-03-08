import Bluebird from "bluebird";
import Sequelize from "sequelize";
import { CommandResponse } from "../../typeDefinitions";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { EmployeeInstance } from "../models/entities/employeeEntity";
import * as EmployeeRepository from "../models/repositories/employeeRepository";

export let execute = (employeeId?: string): Bluebird<CommandResponse<void>> => {
	if ((employeeId == null) || (employeeId.trim() === "")) {
		return Bluebird.resolve(<CommandResponse<void>>{ status: 204 });
	}

	let deleteTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Bluebird<EmployeeInstance | null> => {
			deleteTransaction = startedTransaction;

			return EmployeeRepository.queryById(employeeId, deleteTransaction);
		}).then((queriedEmployee: (EmployeeInstance | null)): Bluebird<void> => {
			if (queriedEmployee == null) {
				return Bluebird.resolve();
			}

			return EmployeeRepository.destroy(queriedEmployee, deleteTransaction);
		}).then((): Bluebird<CommandResponse<void>> => {
			deleteTransaction.commit();

			return Bluebird.resolve(<CommandResponse<void>>{ status: 204 });
		}).catch((error: any): Bluebird<CommandResponse<void>> => {
			if (deleteTransaction != null) {
				deleteTransaction.rollback();
			}

			return Bluebird.reject(<CommandResponse<void>>{
				status: (error.status || 500),
				message: (error.message || ErrorCodeLookup.EC1203)
			});
		});
};
