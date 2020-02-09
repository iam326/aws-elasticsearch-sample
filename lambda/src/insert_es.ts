'use strict';

import { connectElasticsearch } from './utils';

exports.handler = async (event: any, context: any, callback: Function) => {
  const es = connectElasticsearch();
  const index = process.env.ES_INDEX;
  if (!index) {
    return;
  }
  const exists = await es.indices.exists({ index })
  if (!exists.body) {
    return;
  }

  const body = event.Records[0].dynamodb.NewImage;
  const result = await es.index({
    index,
    body
  })
  await es.indices.refresh({ index })

  return callback(null, result);
}
