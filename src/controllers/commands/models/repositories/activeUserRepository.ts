import Bluebird from "bluebird";
import Sequelize from "sequelize";
import { ActiveUserAttributes, ActiveUserEntity, ActiveUserInstance } from "../entities/activeUserEntity";

export let queryById = (id: string, queryTransaction?: Sequelize.Transaction): Bluebird<ActiveUserInstance | null> => {
	return ActiveUserEntity.findOne(<Sequelize.FindOptions<ActiveUserAttributes>>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions<ActiveUserAttributes>>{ id: id }
	});
};

export let queryBySessionKey = (sessionKey: string, queryTransaction?: Sequelize.Transaction): Bluebird<ActiveUserInstance | null> => {
	return ActiveUserEntity.findOne(<Sequelize.FindOptions<ActiveUserAttributes>>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions<ActiveUserAttributes>>{ sessionKey: sessionKey }
	});
};

export let queryByEmployeeId = (employeeId: string, queryTransaction?: Sequelize.Transaction): Bluebird<ActiveUserInstance | null> => {
	return ActiveUserEntity.findOne(<Sequelize.FindOptions<ActiveUserAttributes>>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions<ActiveUserAttributes>>{ employeeId: employeeId }
	});
};

export let create = (newActiveUser: ActiveUserAttributes, createTransaction?: Sequelize.Transaction): Bluebird<ActiveUserInstance> => {
	return ActiveUserEntity.create(
		newActiveUser,
		<Sequelize.CreateOptions>{
			transaction: createTransaction
		});
};

export let destroy = (activeUserEntry: ActiveUserInstance, destroyTransaction?: Sequelize.Transaction): Bluebird<void> => {
	return activeUserEntry.destroy(
		<Sequelize.InstanceDestroyOptions>{
			transaction: destroyTransaction
		});
};
