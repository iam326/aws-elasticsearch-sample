'use strict';

import { connectElasticsearch } from './utils';

process.env.ENV_NAME = 'local';
process.env.ES_ENDPOINT = 'http://localhost:9200';

const es = connectElasticsearch();
const index = 'sample';

async function main() {
  let result, body;

  const exists = await es.indices.exists({ index })
  if (exists.body) {
    await es.indices.delete({ index });
  }

  result = await es.cat.indices();
  console.log(result.body);

  await es.index({
    index,
    body: {
      name: 'takahashi',
      sex: 'man',
      age: 25
    },
    refresh: 'true'
  });

  const dataset = [
    {
      name: 'inoue',
      sex: 'man',
      age: 19
    },
    {
      name: 'tanaka',
      sex: 'woman',
      age: 28
    }
  ];

  body = dataset.flatMap(doc => [{index: { _index: index }}, doc]);
  await es.bulk({
    body,
    refresh: 'true'
  });

  await es.indices.refresh({ index });

  result = await es.search({
    index,
    body: { query: { match_all: {} } }
  });

  console.info('<match all>');
  console.info('total:', result.body.hits.total.value);
  console.info(result.body.hits.hits.map((e: any) => e._source.name).toString());

  result = await es.search({
    index,
    body: { 
      _source: [
        'name',
      ],
      query: { 
        match: { sex: 'man' }
      } 
    }
  });

  console.info('<match>');
  console.info('total:', result.body.hits.total.value);
  console.info(result.body.hits.hits.map((e: any) => e._source.name).toString());

}

main()
