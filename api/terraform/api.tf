
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

resource "aws_api_gateway_resource" "term_categories_resource" {
    parent_id = aws_api_gateway_resource.term_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "categories"
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

    request_parameters = {
        "method.request.querystring.term" = true
    }
}

resource "aws_api_gateway_integration" "delete_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = aws_api_gateway_method.delete_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.delete_term.invoke_arn

    request_parameters = {
        "integration.request.querystring.term" = "method.request.querystring.term"
    }
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

    request_parameters = {
        "method.request.querystring.term" = true
    }
}

resource "aws_api_gateway_integration" "get_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_resource.id
    http_method = aws_api_gateway_method.get_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.get_term.invoke_arn

    request_parameters = {
        "integration.request.querystring.term" = "method.request.querystring.term"
    }
}


# Adding a scan resource
resource "aws_api_gateway_resource" "term_scan_resource" {
    parent_id = aws_api_gateway_resource.term_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "scan"
}

# Creating the Scan Terms Lambda Function
resource "aws_lambda_function" "scan_terms" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "scan_terms"
    handler = "app.scanTerms"

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

resource "aws_lambda_permission" "scan_terms_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.scan_terms.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Terms Method and Integration
resource "aws_api_gateway_method" "scan_terms_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_scan_resource.id
    http_method = "GET"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.lastTerm" = false
        "method.request.querystring.limit" = false
    }
}

resource "aws_api_gateway_integration" "scan_terms_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_scan_resource.id
    http_method = aws_api_gateway_method.scan_terms_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.scan_terms.invoke_arn

    request_parameters = {
        "integration.request.querystring.lastTerm" = "method.request.querystring.lastTerm"
        "integration.request.querystring.limit" = "method.request.querystring.limit"
    }
}

# Category Resource
# Creating the Category Resource
resource "aws_api_gateway_resource" "category_resource" {
    parent_id = aws_api_gateway_rest_api.glossary_api.root_resource_id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "category"
}

resource "aws_api_gateway_resource" "category_scan_resource" {
    parent_id = aws_api_gateway_resource.category_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "scan"
}

resource "aws_api_gateway_resource" "category_associate_resource" {
    parent_id = aws_api_gateway_resource.category_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "associate"
}

resource "aws_api_gateway_resource" "category_terms_resource" {
    parent_id = aws_api_gateway_resource.category_resource.id
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    path_part = "terms"
}



# Create and Update Category
resource "aws_lambda_function" "create_and_update_category" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "create_and_update_category"
    handler = "app.createAndUpdateCategory"

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

resource "aws_lambda_permission" "create_and_update_category_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.create_and_update_category.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Create Category Method and Integration
resource "aws_api_gateway_method" "create_and_update_category_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = "PUT"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_and_update_category_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = aws_api_gateway_method.create_and_update_category_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.create_and_update_category.invoke_arn
}


# Get Category
resource "aws_lambda_function" "get_category" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "get_category"
    handler = "app.getCategory"

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

resource "aws_lambda_permission" "get_category_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.get_category.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Category Method and Integration
resource "aws_api_gateway_method" "get_category_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = "GET"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.category" = true
    }
}

resource "aws_api_gateway_integration" "get_category_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = aws_api_gateway_method.get_category_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.get_category.invoke_arn

    request_parameters = {
        "integration.request.querystring.category" = "method.request.querystring.category"
    }
}

# Delete Category
resource "aws_lambda_function" "delete_category" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "delete_category"
    handler = "app.deleteCategory"

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

resource "aws_lambda_permission" "delete_category_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.delete_category.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Delete Category Method and Integration
resource "aws_api_gateway_method" "delete_category_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = "DELETE"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.category" = true
    }
}

resource "aws_api_gateway_integration" "delete_category_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_resource.id
    http_method = aws_api_gateway_method.delete_category_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.delete_category.invoke_arn

    request_parameters = {
        "integration.request.querystring.category" = "method.request.querystring.category"
    }
}


# Creating the Scan Categories Lambda Function  
resource "aws_lambda_function" "scan_categories" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "scan_categories"
    handler = "app.scanCategories"

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

resource "aws_lambda_permission" "scan_categories_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.scan_categories.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Categories Method and Integration
resource "aws_api_gateway_method" "scan_categories_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_scan_resource.id
    http_method = "GET"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.lastCategory" = false
        "method.request.querystring.limit" = false
    }
}

resource "aws_api_gateway_integration" "scan_categories_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_scan_resource.id
    http_method = aws_api_gateway_method.scan_categories_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.scan_categories.invoke_arn

    request_parameters = {
        "integration.request.querystring.lastCategory" = "method.request.querystring.lastCategory"
        "integration.request.querystring.limit" = "method.request.querystring.limit"
    }
}

# Associate Category and Term
resource "aws_lambda_function" "associate_category_and_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "associate_category_and_term"
    handler = "app.associateCategoryAndTerm"

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

resource "aws_lambda_permission" "associate_category_and_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.associate_category_and_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Associate Category and Term Method and Integration
resource "aws_api_gateway_method" "associate_category_and_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_associate_resource.id
    http_method = "PUT"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "associate_category_and_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_associate_resource.id
    http_method = aws_api_gateway_method.associate_category_and_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.associate_category_and_term.invoke_arn
}

# Disassociate Category and Term
resource "aws_lambda_function" "disassociate_category_and_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "disassociate_category_and_term"
    handler = "app.disassociateCategoryAndTerm"

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

resource "aws_lambda_permission" "disassociate_category_and_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.disassociate_category_and_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Disassociate Category and Term Method and Integration
resource "aws_api_gateway_method" "disassociate_category_and_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_associate_resource.id
    http_method = "DELETE"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "disassociate_category_and_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_associate_resource.id
    http_method = aws_api_gateway_method.disassociate_category_and_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.disassociate_category_and_term.invoke_arn
}


###
### Get Terms for Category
###


# Creating the Scan Categories Lambda Function  
resource "aws_lambda_function" "query_terms_for_category" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "query_terms_for_category"
    handler = "app.queryTermsForCategory"

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

resource "aws_lambda_permission" "query_terms_for_category_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.query_terms_for_category.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Categories Method and Integration
resource "aws_api_gateway_method" "query_terms_for_category_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_terms_resource.id
    http_method = "GET"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.category" = true
        "method.request.querystring.lastTerm" = false
        "method.request.querystring.limit" = false
    }
}

resource "aws_api_gateway_integration" "query_terms_for_category_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.category_terms_resource.id
    http_method = aws_api_gateway_method.query_terms_for_category_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.query_terms_for_category.invoke_arn

    request_parameters = {
        "integration.request.querystring.category" = "method.request.querystring.category"
        "integration.request.querystring.lastTerm" = "method.request.querystring.lastTerm"
        "integration.request.querystring.limit" = "method.request.querystring.limit"
    }
}


###
### Get Categories for Term
###


# Creating the Scan Categories Lambda Function  
resource "aws_lambda_function" "query_categories_for_term" {
    runtime = "nodejs20.x"
    role = aws_iam_role.glossy_lambda_execution_role.arn

    function_name = "query_categories_for_term"
    handler = "app.queryCategoriesForTerm"

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

resource "aws_lambda_permission" "query_categories_for_term_api_gateway_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.query_categories_for_term.function_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${aws_api_gateway_rest_api.glossary_api.execution_arn}/*/*"
}

# Registering the Get Categories Method and Integration
resource "aws_api_gateway_method" "query_categories_for_term_method" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_categories_resource.id
    http_method = "GET"
    authorization = "NONE"

    request_parameters = {
        "method.request.querystring.term" = true
        "method.request.querystring.lastCategory" = false
        "method.request.querystring.limit" = false
    }
}

resource "aws_api_gateway_integration" "query_categories_for_term_integration" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    resource_id = aws_api_gateway_resource.term_categories_resource.id
    http_method = aws_api_gateway_method.query_categories_for_term_method.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = aws_lambda_function.query_categories_for_term.invoke_arn

    request_parameters = {
        "integration.request.querystring.term" = "method.request.querystring.term"
        "integration.request.querystring.lastCategory" = "method.request.querystring.lastCategory"
        "integration.request.querystring.limit" = "method.request.querystring.limit"
    }
}

# Registering the Deployment
resource "aws_api_gateway_deployment" "glossary_api_deployment" {
    rest_api_id = aws_api_gateway_rest_api.glossary_api.id
    stage_name = "prod"

    depends_on = [
        aws_api_gateway_integration.create_and_update_term_integration,
        aws_api_gateway_integration.delete_term_integration,
        aws_api_gateway_integration.get_term_integration,
        aws_api_gateway_integration.scan_terms_integration,
        aws_api_gateway_integration.scan_categories_integration,
        aws_api_gateway_integration.associate_category_and_term_integration,
        aws_api_gateway_integration.disassociate_category_and_term_integration,
        aws_api_gateway_integration.create_and_update_category_integration,
        aws_api_gateway_integration.get_category_integration,
        aws_api_gateway_integration.delete_category_integration,
        aws_api_gateway_integration.query_terms_for_category_integration,
        aws_api_gateway_integration.query_categories_for_term_integration,
    ]

    variables = {
        deployed_at = "${timestamp()}"
    }
}

output "api_endpoint" {
    value = "${aws_api_gateway_deployment.glossary_api_deployment.invoke_url}"
}
