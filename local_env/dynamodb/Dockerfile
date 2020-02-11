FROM amazon/dynamodb-local:1.12.0

WORKDIR /home/dynamodblocal

# UID 1000 は DynamoDB Local の実行ユーザー
RUN mkdir data && chown -R 1000 data
