'use strict';

import { connectElasticsearch } from './utils';

exports.handler = async (event: any, context: any, callback: Function) => {
  const es = connectElasticsearch();
  const index = process.env.ES_INDEX;
  if (!index) {
    console.warn('ES_INDEX is not defined.');
    return;
  }

  const data = event.Records[0].dynamodb.NewImage;
  if (!data || !data.title || !data.body) {
    console.warn('NewImage is not found.');
    return;
  }

  const body: any = {};
  Object.keys(data).forEach(k => body[k] = Object.values(data[k])[0]);
  const result = await es.index({
    index,
    body,
    refresh: 'true'
  });

  return callback(null, result);
}
