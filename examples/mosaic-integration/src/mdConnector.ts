import { MDConnection, QueryResult } from '@motherduck/wasm-client';
import { Connector, Query } from '@uwdata/vgplot';
import * as arrow from 'apache-arrow';

async function arrowTableFromResult(result: QueryResult) {
  if (result.type === 'streaming') {
    const batches = await result.arrowStream.readAll();
    const table = new arrow.Table(batches);
    return table;
  } else {
    throw Error('expected streaming result');
  }
}

export function mdConnector(token: string): Connector {
  const connection = MDConnection.create({
    mdToken: token,
  });
  return {
    query: async (query: Query) => {
      const { sql, type } = query;
      const result = await connection.evaluateStreamingQuery(sql);
      switch (type) {
        case 'arrow':
          return arrowTableFromResult(result);
        case 'json':
          return Array.from(await arrowTableFromResult(result));
        default:
        case 'exec':
          return undefined;
      }
    },
  };
}
