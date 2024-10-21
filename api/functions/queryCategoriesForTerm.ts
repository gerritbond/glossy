import { MetricUnit } from "@aws-lambda-powertools/metrics";
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import type { Subsegment } from "aws-xray-sdk-core";
import { assertIsError } from "#helpers/utils";
import { logger, metrics, tracer } from "#powertools";
import { queryCategoriesForTermFromDynamoDB } from "#helpers/queryCategoriesForTerm";

/**
 * Scan over terms in the table, using pagination.
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

	if (event.httpMethod !== "GET") {
		throw new Error(
			`queryCategoriesForTerm only accepts GET method, you tried: ${event.httpMethod}`,
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
        const term = event.queryStringParameters?.term;
        const lastCategory = event.queryStringParameters?.lastCategory;
        const limit = +(event.queryStringParameters?.limit ?? 1000);

		if(!term) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Term is required" }),
            };
        }
    
        const { items, lastEvaluatedKey } = await queryCategoriesForTermFromDynamoDB(logger, term, limit, lastCategory);
    
		return {
			statusCode: 200,
			body: JSON.stringify({ message: "success", 
				categories: items,
				lastEvaluatedKey,
			}),
		};
	} catch (err) {
		assertIsError(err);

		tracer.addErrorAsMetadata(err);
		metrics.addMetric("queryCategoriesForTermErrors", MetricUnit.Count, 1);

		logger.error("error querying categories for term", err);

		return {
			statusCode: 500,
			body: JSON.stringify({ message: "error querying categories for term" }),
		};
	} finally {
		if (segment && handlerSegment) {
			handlerSegment.close();
			tracer.setSegment(segment);
		}
	}
};
