import Sequelize from "sequelize";
import { DatabaseConnection } from "../databaseConnection";
import { DatabaseTableName } from "../constants/databaseTableNames";
import { ActiveUserFieldName } from "../constants/fieldNames/activeUserFieldNames";
import { EmployeeClassification } from "../constants/entityTypes/employeeClassification";

const modelName: string = "ActiveUser";

export interface ActiveUserAttributes {
	id?: string;
	name: string;
	createdOn?: Date;
	employeeId: string;
	sessionKey: string;
	classification: number;
}

export interface ActiveUserInstance extends Sequelize.Instance<ActiveUserAttributes> {
	id: string;
	name: string;
	createdOn: Date;
	employeeId: string;
	sessionKey: string;
	classification: number;
}

export let ActiveUserEntity: Sequelize.Model<ActiveUserInstance, ActiveUserAttributes> =
	DatabaseConnection.define<ActiveUserInstance, ActiveUserAttributes>(
		modelName,
		<Sequelize.DefineModelAttributes<ActiveUserAttributes>>{
			id: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.ID,
				type: Sequelize.UUID,
				autoIncrement: true,
				primaryKey: true
			},
			name: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.Name,
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: ""
			},
			createdOn: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.CreatedOn,
				type: Sequelize.DATE,
				allowNull: true
			},
			employeeId: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.EmployeeId,
				type: Sequelize.UUID,
				allowNull: false,
				defaultValue: ""
			},
			sessionKey: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.SessionKey,
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: ""
			},
			classification: <Sequelize.DefineAttributeColumnOptions>{
				field: ActiveUserFieldName.Classification,
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: EmployeeClassification.NotDefined
			}
		},
		<Sequelize.DefineOptions<ActiveUserInstance>>{
			timestamps: false,
			freezeTableName: true,
			tableName: DatabaseTableName.ActiveUser
		});
