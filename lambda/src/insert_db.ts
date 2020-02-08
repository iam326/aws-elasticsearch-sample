'use strict';

import AWS from 'aws-sdk';
import uuid from 'node-uuid';

AWS.config.update({region: 'ap-northeast-1'});

const docClient = new AWS.DynamoDB.DocumentClient(
  { region: 'ap-northeast-1' }
);

exports.handler = async (event: any, context: any, callback: Function) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) { 
    return;
  }

  const item = {
    id: uuid.v4(),
    title: 'SAMPLE 1',
    body: 'hogehoge'
  }

  const params = {
    TableName: tableName,
    Item: item
  }

  try {
    await docClient.put(params).promise();
  } catch (e) {
    console.log(e);
    return;
  }

  return callback(null, 'ok');
}
