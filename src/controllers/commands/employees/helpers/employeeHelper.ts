import * as crypto from "crypto";
import { Employee } from "../../../typeDefinitions";
import { EmployeeInstance } from "../../models/entities/employeeEntity";
import { EmployeeClassification } from "../../models/constants/entityTypes/employeeClassification";

const employeeIdBase: string = "00000";

export let padEmployeeId = (employeeId: number): string => {
	const employeeIdAsString: string = employeeId.toString();

	return (employeeIdBase + employeeIdAsString)
		.slice(-Math.max(employeeIdBase.length, employeeIdAsString.length));
};

export let mapEmployeeData = (queriedEmployee: EmployeeInstance): Employee => {
	return <Employee>{
		id: queriedEmployee.id,
		active: queriedEmployee.active,
		lastName: queriedEmployee.lastName,
		createdOn: queriedEmployee.createdOn,
		firstName: queriedEmployee.firstName,
		managerId: queriedEmployee.managerId,
		employeeId: padEmployeeId(queriedEmployee.employeeId),
		classification: <EmployeeClassification>queriedEmployee.classification
	};
};

export let hashString = (toHash: string): string => {
	const hash = crypto.createHash("sha256");
	hash.update(toHash);
	return hash.digest("hex");
};
