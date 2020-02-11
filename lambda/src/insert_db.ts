'use strict';

import uuid from 'node-uuid';
import { getDynamoDocClient } from './utils';

const docClient = getDynamoDocClient();

exports.handler = async (event: any, context: any, callback: Function) => {
  const { title, body } = event;
  if (!title || !body) {
    console.warn('title or body is not found.');
    return;
  }

  const tableName = process.env.TABLE_NAME;
  if (!tableName) { 
    console.warn('TABLE_NAME is not defined.');
    return;
  }

  const item = {
    id: uuid.v4(),
    title,
    body
  }

  const params = {
    TableName: tableName,
    Item: item
  }

  try {
    await docClient.put(params).promise();
  } catch (e) {
    console.error(e);
    return;
  }

  return callback(null, 'ok');
}
