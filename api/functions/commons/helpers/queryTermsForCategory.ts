import { QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger } from "#types";

/**
 * Query the DynamoDB table and return all items with pagination support.
 *
 * @param logger A logger instance
 * @param limit The maximum number of items to return per page (optional, default: 1000)
 * @param startKey The exclusive start key for pagination (optional)
 */
const queryTermsForCategoryFromDynamoDB = async (
	logger: DebugLogger,
	category: string,
	limit = 1000,
	startKey?: string | null,
): Promise<{
	items: QueryCommandOutput["Items"];
	lastEvaluatedKey: string;
}> => {
	const response = await docClient.send(
		new QueryCommand({
			TableName: itemsTableName,
			IndexName: "category_index",
			KeyConditionExpression: "pk = :category",
			// FilterExpression: "begins_with(sk, :termPrefix)",
			ExpressionAttributeValues: {
				":category": `Category-${category}`,
				":termPrefix": "Term-",
			},
			Limit: limit,
			ExclusiveStartKey: startKey ? { pk: `Category-${category}`, sk: `Term-${startKey}` } : undefined,
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return {
		items: response.Items || [],
		lastEvaluatedKey: response.LastEvaluatedKey?.sk ?? "",
	};
};

export { queryTermsForCategoryFromDynamoDB };
