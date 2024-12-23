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
const scanTermsFromDynamoDB = async (
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
			Limit: limit,
			FilterExpression: "begins_with(sk, :termPrefix)",
			ExpressionAttributeValues: {
				":termPrefix": "Term-",
			},
			ExclusiveStartKey: startKey ? { pk: `Term-${startKey}`, sk: `Term-${startKey}` } : undefined,
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return {
		items: response.Items || [],
		lastEvaluatedKey: response.LastEvaluatedKey?.term ?? "",
	};
};

export { scanTermsFromDynamoDB };
