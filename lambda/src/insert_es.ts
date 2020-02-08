'use strict';

import AWS from 'aws-sdk';
import { Client } from '@elastic/elasticsearch';
const AmazonConnection = require('aws-elasticsearch-connector').AmazonConnection;

AWS.config.update({region: 'ap-northeast-1'});

function connectElasticsearch() {
  const env_name = process.env.ENV_NAME;
  const endpoint = process.env.ES_ENDPOINT;
  if (!env_name || !endpoint) {
    throw 'error';
  }

  let params: any = { node: endpoint };
  if (env_name === 'aws') {
    params.Connection = AmazonConnection;
  }
  return new Client(params);
}

exports.handler = async (event: any, context: any, callback: Function) => {
  console.log(event.Records[0].dynamodb.NewImage);
  return callback(null, 'ok');
  /*
  const es = connectElasticsearch();
  const index = 'todo';

  const result = await es.cat.indices();
  console.log(result.body);

  const exists = await es.indices.exists({ index })
  if (exists.body) {
    await es.indices.delete({ index });
  }

  await es.index({
    index,
    body: {
      title: 'Sample Title 1',
      body: 'hoge fuga'
    }
  })

  await es.index({
    index,
    body: {
      title: 'Sample Title 2',
      body: 'foo bar'
    }
  })

  await es.index({
    index,
    body: {
      title: 'Sample Title 3',
      body: 'hoge foo bar'
    }
  })

  await es.indices.refresh({ index })

  const { body } = await es.search({
    index,
    body: {
      query: {
        match: { body: 'hoge' }
      }
    }
  });

  return callback(null, body.hits.hits);
  */
}
