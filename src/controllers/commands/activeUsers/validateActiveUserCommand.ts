import Bluebird from "bluebird";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, ActiveUser } from "../../typeDefinitions";
import { ActiveUserInstance } from "../models/entities/activeUserEntity";
import * as ActiveUserRepository from "../models/repositories/activeUserRepository";

export let execute = (sessionKey: string): Bluebird<CommandResponse<ActiveUser>> => {
	return ActiveUserRepository.queryBySessionKey(sessionKey)
		.then((queriedActiveUser: (ActiveUserInstance | null)): Bluebird<CommandResponse<ActiveUser>> => {
			if (!queriedActiveUser) {
				return Bluebird.reject(<CommandResponse<ActiveUser>>{
					status: 401,
					message: ErrorCodeLookup.EC2602
				});
			}

			return Bluebird.resolve(<CommandResponse<ActiveUser>>{
				status: 200,
				data: queriedActiveUser
			});
	});
};
