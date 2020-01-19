'use strict';

const AWS = require('aws-sdk');
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
          resolve(output.OutputValue);
        }
      }
      reject('not found');
    });
  });
}

function connectElasticsearch(host: string) {
  return require('elasticsearch').Client({
    hosts: [host],
    connectionClass: require('http-aws-es')
  });
}

async function main() {
  const stackName = 'aws-elasticsearch-sample-stack';
  const outputKeyName = 'ElasticSearchDomainEndpoint';
  const endpoint = await getESDomainEndpoint(stackName, outputKeyName);
  const es = connectElasticsearch(endpoint);
  console.log(es);
}

main();
