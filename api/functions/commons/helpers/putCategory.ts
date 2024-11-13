import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { Category, DebugLogger } from "#types";

const putCategoryInDynamoDB = async (
	category: Category,
	logger: DebugLogger,
): Promise<{ category: Category }> => {
	category.lastUpdatedAt = new Date().toISOString();

	const response = await docClient.send(
		new PutCommand({
			TableName: itemsTableName,
			Item: {
				...category,
				type: "Category",
				pk: `Category-${category.category}`,
				sk: `Category-${category.category}`,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return { category };
};

export { putCategoryInDynamoDB };
