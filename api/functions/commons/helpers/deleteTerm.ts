import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger, Term } from "#types";

const deleteTermFromDynamoDB = async (
	term: string,
	logger: DebugLogger,
): Promise<{ success: boolean }> => {
	const response = await docClient.send(
		new DeleteCommand({
			TableName: itemsTableName,
			Key: {
				term,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return { success: true };
};

export { deleteTermFromDynamoDB };
