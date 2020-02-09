'use strict';

import uuid from 'node-uuid';
import { getDynamoDocClient } from './utils';

const docClient = getDynamoDocClient();

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
