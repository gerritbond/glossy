import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger } from "#types";

const associateCategoryWithTermInDynamoDB = async (
	term: string,
	category: string,
	logger: DebugLogger,
): Promise<{ term: string, category: string }> => {
	const response = await docClient.send(
		new PutCommand({
			TableName: itemsTableName,
			Item: {
				lastUpdatedAt: new Date().toISOString(),
				pk: `Term-${term}`,
				sk: `Category-${category}`,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return { term, category };
};

export { associateCategoryWithTermInDynamoDB };
