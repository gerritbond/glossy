import { MetricUnit } from "@aws-lambda-powertools/metrics";
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import type { Subsegment } from "aws-xray-sdk-core";
import { assertIsError } from "#helpers/utils";
import { logger, metrics, tracer } from "#powertools";
import { associateCategoryWithTermInDynamoDB } from "#helpers/associateCategoryWithTerm";

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

	if (event.httpMethod !== "PUT") {
		throw new Error(
			`associateCategoryAndTerm only accepts PUT method, you tried: ${event.httpMethod}`,
		);
	}

	if (!event.body) {
		throw new Error("Event does not contain body");
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

		const body = JSON.parse(event.body);
		const {
			term,
			category
		} = body;
    
        const association = await associateCategoryWithTermInDynamoDB(term, category, logger);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "success", association }),
		};
	} catch (err) {
		assertIsError(err);

		tracer.addErrorAsMetadata(err);
		metrics.addMetric("associationErrors", MetricUnit.Count, 1);

		logger.error("error associating category and term", err);

		return {
			statusCode: 500,
			body: JSON.stringify({ message: "error associating category and term" }),
		};
	} finally {
		if (segment && handlerSegment) {
			handlerSegment.close();
			tracer.setSegment(segment);
		}
	}
};
