
# Defining the top level API Gateway
resource "aws_api_gateway_rest_api" "glossary_api" {
    name = "glossary_api"
    description = "API for Creating and managing glossary terms"

    tags = {
        IaC = var.iac_tag
    }
}

# Creating the Term Resource
resource "aws_api_gateway_resource" "term_resource" {
    parent_id = aws_api_gateway_rest_api.glossary_api.root_resource_id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "term"
}

# Defining the Lambda Functions and API Gateway Callers
resource "aws_lambda_function" "create_and_update_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "create_and_update_term"
    handler = "app.createAndUpdateTerm"

    filename = data.archive_file.api_zip.output_path
    source_code_hash = data.archive_file.api_zip.output_base64sha256

    environment {
        variables = {
            DYNAMODB_TABLE = aws_dynamodb_table.glossary_terms.name
        }
    }

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_lambda_permission" "create_and_update_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.create_and_update_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Create Term Method and Integration
resource "aws_api_gateway_method" "create_and_update_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = "PUT"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_and_update_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = aws_api_gateway_method.create_and_update_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.create_and_update_term.invoke_arn
}

# Delete Term
resource "aws_lambda_function" "delete_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "delete_term"
    handler = "app.deleteTerm"

    filename = data.archive_file.api_zip.output_path
    source_code_hash = data.archive_file.api_zip.output_base64sha256

    environment {
        variables = {
            DYNAMODB_TABLE = aws_dynamodb_table.glossary_terms.name
        }
    }

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_lambda_permission" "delete_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.delete_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Delete Term Method and Integration
resource "aws_api_gateway_method" "delete_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = "DELETE"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = aws_api_gateway_method.delete_term_method.http_method
    integration_http_method = "DELETE"
    type = "AWS_PROXY"
    uri = aws_lambda_function.delete_term.invoke_arn
}

# Get Term
resource "aws_lambda_function" "get_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "get_term"
    handler = "app.getTerm"

    filename = data.archive_file.api_zip.output_path
    source_code_hash = data.archive_file.api_zip.output_base64sha256

    environment {
        variables = {
            DYNAMODB_TABLE = aws_dynamodb_table.glossary_terms.name
        }
    }

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_lambda_permission" "get_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.get_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Term Method and Integration
resource "aws_api_gateway_method" "get_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = aws_api_gateway_method.get_term_method.http_method
    integration_http_method = "GET"
    type = "AWS_PROXY"
    uri = aws_lambda_function.get_term.invoke_arn
}


# Adding a scan resource
resource "aws_api_gateway_resource" "term_scan_resource" {
    parent_id = aws_api_gateway_resource.term_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "scan"
}

# Creating the Get Terms Lambda Function
resource "aws_lambda_function" "get_terms" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "get_terms"
    handler = "app.getTerms"

    filename = data.archive_file.api_zip.output_path
    source_code_hash = data.archive_file.api_zip.output_base64sha256

    environment {
        variables = {
            DYNAMODB_TABLE = aws_dynamodb_table.glossary_terms.name
        }
    }

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_lambda_permission" "get_terms_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.get_terms.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Terms Method and Integration
resource "aws_api_gateway_method" "get_terms_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_scan_resource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_terms_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_scan_resource.id
    http_method = aws_api_gateway_method.get_terms_method.http_method
    integration_http_method = "GET"
    type = "AWS_PROXY"
    uri = aws_lambda_function.get_terms.invoke_arn
}

# Registering the Deployment
resource "aws_api_gateway_deployment" "glossary_api_deployment" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    stage_name = "prod"

    depends_on = [
        aws_api_gateway_integration.create_and_update_term_integration,
        aws_api_gateway_integration.delete_term_integration,
        aws_api_gateway_integration.get_term_integration,
        aws_api_gateway_integration.get_terms_integration
    ]
}

output "api_endpoint" {
    value = "${aws_api_gateway_deployment.glossary_api_deployment.invoke_url}"
}
