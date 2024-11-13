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
			KeyConditionExpression: "#pk = :category and begins_with(#sk, :termPrefix)",
			ExpressionAttributeNames: {
				"#pk": "pk",
				"#sk": "sk",
			},
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

	const terms = response.Items?.filter((item) => item.type === "CategoryAssociation").map((item) => ({
			term: item.sk.replace("Term-", ""),
			category: item.pk.replace("Category-", ""),
	}));

	return {
		items: terms || [],
		lastEvaluatedKey: response.LastEvaluatedKey?.sk.replace("Term-", "") ?? "",
	};
};

export { queryTermsForCategoryFromDynamoDB };
