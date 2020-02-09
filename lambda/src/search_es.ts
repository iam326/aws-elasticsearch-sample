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

  const { body } = await es.search({
    index,
    body: {
      query: {
        match: { body: 'hoge' }
      }
    }
  });

  return callback(null, body.hits.hits);
}
