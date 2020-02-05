'use strict';

import AWS from 'aws-sdk';
import { Client } from '@elastic/elasticsearch';
const AmazonConnection = require('aws-elasticsearch-connector').AmazonConnection;

AWS.config.update({region: 'ap-northeast-1'});

const cfn = new AWS.CloudFormation();

function getESDomainEndpoint(stackName: string, outputKeyName: string): Promise<string> {
  return new Promise((resolve, reject)=> {
    const params = {
      StackName: stackName
    };
    cfn.describeStacks(params, function(err: any, data: any) {
      if (err) {
        reject(err);
      }
      const outputs = data.Stacks[0].Outputs;
      for (const output of outputs) {
        if (output.OutputKey === outputKeyName) {
          resolve(`https://${output.OutputValue}`);
        }
      }
      reject('not found');
    });
  });
}

function connectElasticsearch(node: string) {
  return new Client({
    node,
    Connection: AmazonConnection,
  } as any);
}

exports.handler = async (event: any, context: any, callback: Function) => {
  const stackName = 'aws-elasticsearch-sample-stack';
  const outputKeyName = 'ElasticSearchDomainEndpoint';
  const endpoint = await getESDomainEndpoint(stackName, outputKeyName);
  const es = connectElasticsearch(endpoint);

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
