import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger } from "#types";

const deleteCategoryFromDynamoDB = async (
	category: string,
	logger: DebugLogger,
): Promise<{ success: boolean }> => {
	const response = await docClient.send(
		new DeleteCommand({
			TableName: itemsTableName,
			Key: {
				pk: `Category-${category}`,
				sk: `Category-${category}`,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return { success: true };
};

export { deleteCategoryFromDynamoDB };
