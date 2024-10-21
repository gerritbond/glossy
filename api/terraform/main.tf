resource "aws_dynamodb_table" "glossary_terms" {
	name = "glossary_terms"
    hash_key = "pk"
    range_key = "sk"

    billing_mode = "PAY_PER_REQUEST"

    attribute {
        name = "pk"
        type = "S"
    }

    attribute {
        name = "sk"
        type = "S"
    }

    global_secondary_index {
        name = "category_index"
        hash_key = "sk"
        range_key = "pk"
        projection_type = "KEYS_ONLY"
    }

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_iam_policy" "glossy_lambda_execution_policy" {
    name = "glossy_lambda_execution_policy"
    policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowDynamoDBAccess",
                "Action": [
                    "dynamodb:DeleteItem",
                    "dynamodb:GetItem",
                    "dynamodb:GetRecords",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:Scan",
                    "dynamodb:Query"
                ],
                "Effect": "Allow",
                "Resource": "arn:aws:dynamodb:${var.region}:${var.account_id}:table/glossary_terms"
            },
            {
                "Sid": "AllowQueryAccessOnIndex",
                "Action": [
                    "dynamodb:Query"
                ],
                "Effect": "Allow",
                "Resource": "arn:aws:dynamodb:${var.region}:${var.account_id}:table/glossary_terms/index/category_index"
            },
            {
                "Sid": "AllowLogging",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Effect": "Allow",
                "Resource": "arn:aws:logs:${var.region}:${var.account_id}:*"
            }
        ]
    })

    tags = {
        IaC = var.iac_tag
    }
}

# Configure Lambda Execution Role
resource "aws_iam_role" "glossy_lambda_execution_role" {
    name = "glossy_lambda_execution_role"
    assume_role_policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AssumeRole",
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service" : [
                        "lambda.amazonaws.com"
                    ]
                }
            }
        ]
    })

    tags = {
        IaC = var.iac_tag
    }
}

resource "aws_iam_role_policy_attachment" "glossy_policy_attachment" {
    role = aws_iam_role.glossy_lambda_execution_role.name
    policy_arn = aws_iam_policy.glossy_lambda_execution_policy.arn
}


data "archive_file" "api_zip" {
    type = "zip"
    source_file = "${path.module}/../dist/app.js"
    output_path = "${path.module}/../app.zip"
}
