import Sequelize from "sequelize";
import { DatabaseConnection } from "../databaseConnection";
import { DatabaseTableName } from "../constants/databaseTableNames";
import { EmployeeFieldName } from "../constants/fieldNames/employeeFieldNames";
import { EmployeeClassification } from "../constants/entityTypes/employeeClassification";

const modelName: string = "Employee";

export interface EmployeeAttributes {
	id?: string;
	active: boolean;
	lastName: string;
	password: Buffer;
	createdOn?: Date;
	firstName: string;
	managerId?: string;
	employeeId?: number;
	classification: number;
}

export interface EmployeeInstance extends Sequelize.Instance<EmployeeAttributes> {
	id: string;
	active: boolean;
	lastName: string;
	password: Buffer;
	createdOn: Date;
	firstName: string;
	managerId: string;
	employeeId: number;
	classification: number;
}

export let EmployeeEntity: Sequelize.Model<EmployeeInstance, EmployeeAttributes> =
	DatabaseConnection.define<EmployeeInstance, EmployeeAttributes>(
		modelName,
		<Sequelize.DefineModelAttributes<EmployeeAttributes>>{
			id: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.ID,
				type: Sequelize.UUID,
				autoIncrement: true,
				primaryKey: true
			},
			active: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.Active,
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true
			},
			lastName: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.LastName,
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: ""
			},
			password: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.Password,
				type: Sequelize.BLOB,
				allowNull: false,
				defaultValue: Buffer.alloc(0)
			},
			createdOn: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.CreatedOn,
				type: Sequelize.DATE,
				allowNull: true
			},
			firstName: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.FirstName,
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: ""
			},
			managerId: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.ManagerId,
				type: Sequelize.UUID,
				allowNull: true
			},
			employeeId: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.EmployeeId,
				type: Sequelize.INTEGER,
				allowNull: true
			},
			classification: <Sequelize.DefineAttributeColumnOptions>{
				field: EmployeeFieldName.Classification,
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: EmployeeClassification.NotDefined
			}
		},
		<Sequelize.DefineOptions<EmployeeInstance>>{
			timestamps: false,
			freezeTableName: true,
			tableName: DatabaseTableName.Employee
		});
