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
const queryCategoriesForTermFromDynamoDB = async (
	logger: DebugLogger,
	term: string,
	limit = 1000,
	startKey?: string | null,
): Promise<{
	items: QueryCommandOutput["Items"];
	lastEvaluatedKey: string;
}> => {
	const response = await docClient.send(
		new QueryCommand({
			TableName: itemsTableName,
			KeyConditionExpression: "pk = :term",
			// FilterExpression: "begins_with(sk, :categoryPrefix)",
			ExpressionAttributeValues: {
				":term": `Term-${term}`,
				":categoryPrefix": "Category-",
			},
			Limit: limit,
			ExclusiveStartKey: startKey ? { pk: `Term-${term}`, sk: `Category-${startKey}` } : undefined,
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

export { queryCategoriesForTermFromDynamoDB };
