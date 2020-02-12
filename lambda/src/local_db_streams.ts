'use strict';

import AWS from 'aws-sdk';
import path from 'path';
import { execute } from 'lambda-local';

process.env.ENV_NAME = 'local';
process.env.ES_ENDPOINT = 'http://localhost:9200';
process.env.ES_INDEX = 'todo';

AWS.config.update({region: 'ap-northeast-1'});

const db = new AWS.DynamoDB({
  endpoint: 'http://localhost:8000'
});

const streams = new AWS.DynamoDBStreams({
  endpoint: 'http://localhost:8000'
});

async function sleep(sec: number) {
  return new Promise(resolve => {
    setTimeout(resolve, sec * 1000)
  });
}

async function getLatestStreamArn(tableName: string) {
  const result = await db.describeTable(
    { TableName: tableName }
  ).promise();
  return result.Table?.LatestStreamArn;
}

async function main() {
  const arn = await getLatestStreamArn('aws-elasticsearch-sample-table');
  if (!arn) { return; }

  const stream = await streams.describeStream({StreamArn: arn}).promise();
  if (!stream.StreamDescription || !stream.StreamDescription.Shards) {
    return;
  }

  const iters: any = {};
  for (const shard of stream.StreamDescription.Shards) {
    const id = shard.ShardId;
    if (!id) { return; }
    const result = await streams.getShardIterator({
      StreamArn: arn,
      ShardId: id,
      ShardIteratorType: 'LATEST'
    }).promise();
    iters[id] = result.ShardIterator;
  }

  while (true) {
    if (Object.keys(iters).length <= 0) {
      break;
    }
    try {
      for (const id in iters) {
        const shard = iters[id];
        if (!shard) {
          delete iters[id];
          continue;
        }
        const records: any = await streams.getRecords({ShardIterator: shard}).promise();
        iters[id] = records.NextShardIterator;
        if (iters[id] === shard || records.Records?.length === 0) {
          continue;
        }

        try {
          const result = await execute({
            event: records,
            lambdaPath: path.join(__dirname, './dist/insert_es.js'),
            timeoutMs: 3000
          });
          console.log(result);
        } catch (e) {
          console.warn(e);
        }

      }
    } catch (e) {
      console.warn(e);
    } finally {
      console.log('sleep...');
      await sleep(3);
    }
  }
}

main();
