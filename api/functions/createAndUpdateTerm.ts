import { MetricUnit } from "@aws-lambda-powertools/metrics";
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import type { Subsegment } from "aws-xray-sdk-core";
import { putTermInDynamoDB } from "#helpers/putTerm";
import { assertIsError } from "#helpers/utils";
import { logger, metrics, tracer } from "#powertools";
import type { Term } from "#types";

/**
 * Create or update a term in the DynamoDB table.
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
			`createAndUpdateTerm only accepts PUT method, you tried: ${event.httpMethod}`,
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
			definition,
			categories,
			relatedTerms,
			isAbbreviation,
			pronunciation,
			example,
		} = body;

		const structuredTerm: Term = {
			lastUpdatedAt: null,
			term,
			definition,
			categories,
			relatedTerms,
			isAbbreviation,
			pronunciation,
			example,
		};

		const createdTerm = await putTermInDynamoDB(structuredTerm, logger);

		metrics.addMetric("termsAdded", MetricUnit.Count, 1);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "success", createdTerm }),
		};
	} catch (err) {
		assertIsError(err);

		tracer.addErrorAsMetadata(err);
		metrics.addMetric("itemsInsertErrors", MetricUnit.Count, 1);

		logger.error("error storing item", err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: `error writing data to table; error message: ${err.message}`,
			}),
		};
	} finally {
		if (segment && handlerSegment) {
			handlerSegment.close();
			tracer.setSegment(segment);
		}
	}
};
