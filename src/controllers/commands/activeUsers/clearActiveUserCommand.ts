import Bluebird from "bluebird";
import Sequelize from "sequelize";
import { CommandResponse } from "../../typeDefinitions";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { ActiveUserInstance } from "../models/entities/activeUserEntity";
import * as ActiveUserRepository from "../models/repositories/activeUserRepository";

const attemptRemoveActiveUser = (lookupData: string, activeUserQuery: (lookupData: string, queryTransaction?: Sequelize.Transaction) => Bluebird<ActiveUserInstance | null>): Bluebird<CommandResponse<void>> => {
	let removeTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((createdTransaction: Sequelize.Transaction): Bluebird<ActiveUserInstance | null> => {
			removeTransaction = createdTransaction;

			return activeUserQuery(lookupData, removeTransaction);
		}).then((queriedActiveUser: (ActiveUserInstance | null)): Bluebird<void> => {
			if (!queriedActiveUser) {
				return Bluebird.resolve();
			}

			return ActiveUserRepository.destroy(queriedActiveUser, removeTransaction);
		}).then((): Bluebird<CommandResponse<void>> => {
			removeTransaction.commit();

			return Bluebird.resolve(<CommandResponse<void>>{ status: 204 });
		}).catch((error: any): Bluebird<CommandResponse<void>> => {
			if (removeTransaction != null) {
				removeTransaction.rollback();
			}

			return Bluebird.resolve(<CommandResponse<void>>{
				status: 500,
				message: error.message
			});
		});
};

export let removeById = (activeUserId?: string): Bluebird<CommandResponse<void>> => {
	if ((activeUserId == null) || (activeUserId.trim() === "")) {
		return Bluebird.resolve(<CommandResponse<void>>{
			status: 422,
			message: ErrorCodeLookup.EC2604
		});
	}

	return attemptRemoveActiveUser(activeUserId, ActiveUserRepository.queryById);
};

export let removeBySessionKey = (sessionKey: string): Bluebird<CommandResponse<void>> => {
	return attemptRemoveActiveUser(sessionKey, ActiveUserRepository.queryBySessionKey);
};
