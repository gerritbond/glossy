import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "#clients/dynamodb";
import { itemsTableName } from "#constants";
import type { DebugLogger, Term } from "#types";

const putTermInDynamoDB = async (
	term: Term,
	logger: DebugLogger,
): Promise<{ term: Term }> => {
	term.lastUpdatedAt = new Date().toISOString();

	const response = await docClient.send(
		new PutCommand({
			TableName: itemsTableName,
			Item: {
				...term,
				type: "Term",
				pk: `Term-${term.term}`,
				sk: `Term-${term.term}`,
			},
		}),
	);

	logger.debug("ddb response", {
		response,
	});

	return { term };
};

export { putTermInDynamoDB };
