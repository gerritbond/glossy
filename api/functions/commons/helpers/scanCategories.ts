import { ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger } from "#types";

/**
 * Scan the DynamoDB table and return all items with pagination support.
 *
 * @param logger A logger instance
 * @param limit The maximum number of items to return per page (optional, default: 1000)
 * @param startKey The exclusive start key for pagination (optional)
 */
const scanCategoriesFromDynamoDB = async (
	logger: DebugLogger,
	limit = 1000,
	startKey?: string | null,
): Promise<{
	items: ScanCommandOutput["Items"];
	lastEvaluatedKey: string;
}> => {
	const response = await docClient.send(
		new ScanCommand({
			TableName: itemsTableName,
			FilterExpression: "begins_with(sk, :categoryPrefix) and begins_with(pk, :categoryPrefix)",
			ExpressionAttributeValues: {
				":categoryPrefix": "Category-",
			},
			Limit: limit,
			ExclusiveStartKey: startKey ? { pk: `Category-${startKey}`, sk: `Category-${startKey}` } : undefined,
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return {
		items: response.Items || [],
		lastEvaluatedKey: response.LastEvaluatedKey?.category ?? "",
	};
};

export { scanCategoriesFromDynamoDB };
