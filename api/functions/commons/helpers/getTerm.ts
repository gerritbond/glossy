import { GetCommand, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger } from "#types";

/**
 * Fetch a term from the DynamoDB table.
 *
 * @param term The term to fetch from the DynamoDB table
 * @param logger A logger instance
 */
const getTermFromDynamoDB = async (
	term: string,
	logger: DebugLogger,
): Promise<GetCommandOutput["Item"]> => {
	const response = await docClient.send(
		new GetCommand({
			TableName: itemsTableName,
			Key: {
				term,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return response.Item;
};

export { getTermFromDynamoDB };
