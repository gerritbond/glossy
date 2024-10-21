import { MetricUnit } from "@aws-lambda-powertools/metrics";
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import type { Subsegment } from "aws-xray-sdk-core";
import { assertIsError } from "#helpers/utils";
import { logger, metrics, tracer } from "#powertools";
import { deleteCategoryFromDynamoDB } from "#helpers/deleteCategory";

/**
 * Delete a term.
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Promise<APIGatewayProxyResult>} object - API Gateway Lambda Proxy Output Format
 *
 */

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	logger.debug("event", { event });

	if (event.httpMethod !== "DELETE") {
		throw new Error(
			`deleteCategory only accepts DELETE method, you tried: ${event.httpMethod}`,
		);
	}
	logger.addContext(context);

	const segment = tracer.getSegment();
	let handlerSegment: Subsegment | undefined;
	if (segment) {
		handlerSegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
		tracer.setSegment(handlerSegment);
	}

	tracer.annotateColdStart();
	tracer.addServiceNameAnnotation();
	metrics.captureColdStartMetric();

	try {
        const category = event.queryStringParameters?.category;

        if(!category) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Category is required" }),
            };
        }
    
        const {success} = await deleteCategoryFromDynamoDB(category, logger);

		return {
			statusCode: success ? 200 : 500,
			body: JSON.stringify({ message: "success", success }),
		};
	} catch (err) {
		assertIsError(err);

		tracer.addErrorAsMetadata(err);
		metrics.addMetric("categoryDeleteErrors", MetricUnit.Count, 1);

		logger.error("error deleting category", err);

		return {
			statusCode: 500,
			body: JSON.stringify({ message: "error deleting category" }),
		};
	} finally {
		if (segment && handlerSegment) {
			handlerSegment.close(); 
			tracer.setSegment(segment);
		}
	}
};