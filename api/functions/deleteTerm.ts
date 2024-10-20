import { MetricUnit } from "@aws-lambda-powertools/metrics";
import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import type { Subsegment } from "aws-xray-sdk-core";
import { assertIsError } from "#helpers/utils";
import { logger, metrics, tracer } from "#powertools";
import { deleteTermFromDynamoDB } from "#helpers/deleteTerm";

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
			`deleteTerm only accepts DELETE method, you tried: ${event.httpMethod}`,
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

        if(!term) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Term is required" }),
            };
        }
    
        const {success} = await deleteTermFromDynamoDB(term, logger);

		return {
			statusCode: success ? 200 : 500,
			body: JSON.stringify({ message: "success", success }),
		};
	} catch (err) {
		assertIsError(err);

		tracer.addErrorAsMetadata(err);
		metrics.addMetric("termDeleteErrors", MetricUnit.Count, 1);

		logger.error("error deleting term", err);

		return {
			statusCode: 500,
			body: JSON.stringify({ message: "error deleting term" }),
		};
	} finally {
		if (segment && handlerSegment) {
			handlerSegment.close(); 
			tracer.setSegment(segment);
		}
	}
};
