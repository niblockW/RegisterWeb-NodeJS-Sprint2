import Bluebird from "bluebird";
import Sequelize from "sequelize";
import { EmployeeFieldName } from "../constants/fieldNames/employeeFieldNames";
import { EmployeeAttributes, EmployeeEntity, EmployeeInstance } from "../entities/employeeEntity";

export let queryById = (id: string, queryTransaction?: Sequelize.Transaction): Bluebird<EmployeeInstance | null> => {
	return EmployeeEntity.findOne(<Sequelize.FindOptions<EmployeeAttributes>>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions<EmployeeAttributes>>{ id: id }
	});
};

export let queryByEmployeeId = (employeeId: number, queryTransaction?: Sequelize.Transaction): Bluebird<EmployeeInstance | null> => {
	return EmployeeEntity.findOne(<Sequelize.FindOptions<EmployeeAttributes>>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions<EmployeeAttributes>>{ employeeId: employeeId }
	});
};

export let queryActive = (): Bluebird<EmployeeInstance[]> => {
	return EmployeeEntity.findAll(<Sequelize.FindOptions<EmployeeAttributes>>{
		order: [ [EmployeeFieldName.CreatedOn, "ASC"] ],
		where: <Sequelize.WhereOptions<EmployeeAttributes>>{ active: true }
	});
};

export let queryActiveExists = (): Bluebird<EmployeeInstance | null> => {
	return EmployeeEntity.findOne(<Sequelize.FindOptions<EmployeeAttributes>>{
		where: <Sequelize.WhereOptions<EmployeeAttributes>>{ active: true }
	});
};

export let create = (newEmployee: EmployeeAttributes, createTransaction?: Sequelize.Transaction): Bluebird<EmployeeInstance> => {
	return EmployeeEntity.create(
		newEmployee,
		<Sequelize.CreateOptions>{
			transaction: createTransaction
		});
};

export let destroy = (employeeEntry: EmployeeInstance, destroyTransaction?: Sequelize.Transaction): Bluebird<void> => {
	return employeeEntry.destroy(
		<Sequelize.InstanceDestroyOptions>{
			transaction: destroyTransaction
		});
};
