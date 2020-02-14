'use strict';

import { connectElasticsearch } from './utils';

process.env.ENV_NAME = 'local';
process.env.ES_ENDPOINT = 'http://localhost:9200';

const es = connectElasticsearch();
const index = 'sample';

function displaySearchResults(result: any[]) {
  console.info(
    result.map(
      (e: any) => Object.values(e._source).join(' ')
    ).join(', ')
  );
}

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
    },
    {
      name: 'takahashi',
      sex: 'woman',
      age: 41
    },
    {
      name: 'tomura',
      sex: 'man',
      age: 68
    }
  ];

  body = dataset.flatMap(doc => [{index: { _index: index }}, doc]);
  await es.bulk({
    body,
    refresh: 'true'
  });

  await es.indices.refresh({ index });

  try {

    result = await es.search({
      index,
      from: 0,
      size: 3,
      body: {
        _source: [ 'name', 'age' ],
        query: { match_all: {} },
        sort: { age: { order: 'desc'} }
      }
    });

    console.info('<match all>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        // collapse: { field: 'name' },
        query: {
          match: { sex: 'man' }
        }
      }
    });

    console.info('<match [man]>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        query: {
          wildcard: { name: 'ta*' }
        }
      }
    });

    console.info('<wildcard [ta*]>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        query: {
          range: {
            age: { gte: 40 }
          }
        }
      }
    });

    console.info('<range age >= 40>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        query: {
          bool: {
            must: [
              { term: { name: 'takahashi' } },
              { term: { sex: 'man' } }
            ]
          }
        }
      }
    });

    console.info('<bool must>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        query: {
          bool: {
            should: [
              { term: { sex: 'woman' } },
              { range: { age: { lt: 20 } } },
            ]
          }
        }
      }
    });

    console.info('<bool should>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        query: {
          bool: {
            must_not: [
              { term: { name: 'takahashi' } }
            ]
          }
        }
      }
    });

    console.info('<bool must not>');
    displaySearchResults(result.body.hits.hits);

    result = await es.search({
      index,
      body: {
        aggs: {
          sum_age: {
            sum: {
              field: 'age'
            }
          }
        }
      }
    });

    console.info('<sum age>');
    console.log(result.body.aggregations.sum_age.value);

    result = await es.sql.query({
      body: {
        query: `SELECT name, sex FROM ${index} WHERE name='takahashi'`
      }
    });

    console.info('<sql select 1>');
    console.log(result.body.rows);

    result = await es.sql.query({
      body: {
        query: `SELECT name, COUNT(name) AS count FROM ${index} GROUP BY name ORDER BY count DESC`
      }
    });
    console.info('<sql select 2>');
    console.log(result.body.rows);

  } catch (e) {
    console.error(e.name, e.body.error);
  }

}

main()
