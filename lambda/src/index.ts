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
  const es = connectElasticsearch();
  es.create({
    index: 'sample-index',
    type: 'sample-type',
    id: '1',
    body: {
      title: 'service name',
      description: 'hogehoge'
    }
  }).then(function (body) {
    console.log(body)
  }, function (error) {
    console.trace(error.message)
  })

  return callback(null, 'Success!');
}
