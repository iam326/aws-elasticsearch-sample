'use strict';

import { connectElasticsearch } from './utils';

exports.handler = async (event: any, context: any, callback: Function) => {
  if (!event.body) {
    return;
  }

  const es = connectElasticsearch();
  const index = process.env.ES_INDEX;
  if (!index) {
    console.warn('ES_INDEX is not defined.');
    return;
  }
  const exists = await es.indices.exists({ index })
  if (!exists.body) {
    console.warn('Index not created.');
    return;
  }

  const { body } = await es.search({
    index,
    body: {
      query: {
        match: { body: event.body }
      }
    }
  });

  return callback(null, body.hits.hits);
}
