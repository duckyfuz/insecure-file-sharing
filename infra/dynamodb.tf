resource "aws_dynamodb_table" "counters" {
  name         = "${local.resource_name}_counters"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "counter_name"

  attribute {
    name = "counter_name"
    type = "S"
  }
}
