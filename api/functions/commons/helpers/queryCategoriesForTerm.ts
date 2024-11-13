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
			ExpressionAttributeValues: {
				":term": `Term-${term}`
			},
			Limit: limit,
			ExclusiveStartKey: startKey ? { pk: `Term-${term}`, sk: `Category-${startKey}` } : undefined,
		}),
	);

	logger.debug("ddb response", {
		response,
	});


	const categories = response.Items?.filter((item) => item.type === "CategoryAssociation").map((item) => ({
			category: item.sk.replace("Category-", ""),
			term: item.pk.replace("Term-", ""),
		}));

	// In theory this could result in returning less results than the limit requests, while still having additional values
	// because we are filtering out the term definition and any future objects that may be added to the collection.
	return {
		items: categories || [],
		lastEvaluatedKey: response.LastEvaluatedKey?.sk.replace("Category-", "") ?? "",
	};
};

export { queryCategoriesForTermFromDynamoDB };
