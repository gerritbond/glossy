import { getStringFromEnv } from "#helpers/utils";

// Get the DynamoDB table name from environment variables
const itemsTableName = getStringFromEnv("DYNAMODB_TABLE");

export { itemsTableName };
