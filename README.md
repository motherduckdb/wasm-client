# MotherDuck WASM Client

[MotherDuck](https://motherduck.com/) is a managed DuckDB-in-the-cloud service.

[DuckDB WASM](https://github.com/duckdb/duckdb-wasm) brings DuckDB to every browser thanks to WebAssembly.

The MotherDuck WASM Client library enables using MotherDuck through DuckDB WASM in your own browser applications.

## Installation

The @motherduckdb/wasm-client package is currently served from an NPM repository hosted on GitHub, not the main NPM repository on [npmjs.com](https://www.npmjs.com/).

Before running `npm install @motherduckdb/wasm-client` in your project, add the following to your `.npmrc` file:

```
@motherduckdb:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<TOKEN>
```

Replace `<TOKEN>` with a GitHub personal access token. This token should have at least `read:packages`. For details on how to generate a token, see [Managing your Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [Authenticating to GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages), and [Authenticating with a Personal Access Token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token). 

(If you don't already have an `.npmrc` file, create one next to the `package.json` file for your project.)

## Requirements

To faciliate efficient communication across worker threads, the MotherDuck WASM Client library currently uses advanced browser features, including [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).

Due to [security requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) of modern browsers, these features require applications to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated).

To use the MotherDuck WASM Client library, your application must be in cross-origin isolation mode, which is enabled when it is served with the following headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

You can check whether your application is in this mode by examining the [crossOriginIsolated](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated) property in the browser console.

Note that applications in this mode are restricted in [some](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy#same-origin) [ways](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy#require-corp). In particular, resources from different origins can only be loaded if they are served with a [Cross-Origin-Resource-Policy (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy) header with the value `cross-origin`.

## Dependencies

The MotherDuck WASM Client library depends on `apache-arrow` as a peer dependency.
If you use `npm` version 7 or later to install `@motherduckdb/wasm-client`, then `apache-arrow` will automatically be installed, if it is not already.

If you already have `apache-arrow` installed, then `@motherduckdb/wasm-client` will use it, as long as it is a compatible version (`^14.0.x` at the time of this writing).

Optionally, you can use a variant of `@motherduckdb/wasm-client` that bundles `apache-arrow` instead of relying on it as a peer dependency.
Don't use this option if you are using `apache-arrow` elsewhere in your application, because different copies of this library don't work together.
To use this version, change your imports to:
```ts
import '@motherduckdb/wasm-client/with-arrow';
```
instead of:
```ts
import '@motherduckdb/wasm-client';
```

## Usage

The MotherDuck WASM Client library is written in TypeScript and exposes full TypeScript type definitions. These instructions assume you are using it from TypeScript.

Once you have installed `@motherduckdb/wasm-client`, you can import the main class, `MDConnection`, as follows:

```ts
import { MDConnection } from '@motherduckdb/wasm-client';
```

### Creating Connections

To create a `connection` to a MotherDuck-connected DuckDB instance, call the `create` static method:

```ts
const connection = MDConnection.create({
  mdToken: token
});
```

The `mdToken` parameter is required and should be set to a valid MotherDuck service token. You can find your MotherDuck service token in the MotherDuck UI, under your user menu in the top right. Click "Settings", then find the "Service token" section. Copy the token using the button to the right of the (obscured) value.

The `create` call returns immediately, but starts the process of loading the DuckDB WASM assets from `https://app.motherduck.com` and starting the DuckDB WASM worker.

This initialization process happens asynchronously. Any query executed before initialization is complete will be queued.

To determine whether initialization is complete, call the `isInitialized` method, which returns a promise resolving to `true` when DuckDB WASM is initialized:

```ts
await connection.isInitialized();
```

Multiple connections can be created. Connections share a DuckDB WASM instance, so creating subsequent connections will not repeat the initialization process.

Queries executed on different connections happen concurrently; queries executed on the same connection are queued sequentially.

### Evaluating Queries

To execute a query, call the `executeQuery` method on the `connection` object:

```ts
try {
  const result = await connection.evaluateQuery(sql);
  console.log('query result', result);
} catch (err) {
  console.log('query failed', err);
}
```

The `executeQuery` method returns a [promise](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises) for the result. In an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function), you can use the `await` syntax as above. Or, you can use the `then` and/or `catch` methods:

```ts
connection.evaluateQuery(sql).then((result) => {
  console.log('query result', result);
}).catch((reason) => {
  console.log('query failed', reason);
});
```

See [Results](#results) below for the structure of the result object.

### Prepared Statements

To evaluate a [prepared](https://duckdb.org/docs/api/c/prepared) [statement](https://duckdb.org/docs/api/wasm/query#prepared-statements), call the `evaluatePreparedStatement` method:

```ts
const result = await connection.evaluatePreparedStatement('SELECT v + ? FROM generate_series(0, 10000) AS t(v);', [234]);
```

### Canceling Queries

To evalute a query that can be canceled, use the `enqueueQuery` and `evaluateQueuedQuery` methods:

```ts
const queryId = connection.enqueueQuery(sql);
const result = await connection.evaluateQueuedQuery(queryId);
```

To cancel a query evaluated in this fashion, use the `cancelQuery` method, passing the `queryId` returned by `enqueueQuery`:

```ts
const queryWasCanceled = await connection.cancelQuery(queryId);
```

The `cancelQuery` method returns a promise for a boolean indicating whether the query was successfully canceled.

The result promise of a canceled query will be rejected with and error message. The `cancelQuery` method takes an optional second argument for controlling this message:

```ts
const queryWasCanceled = await connection.cancelQuery(queryId, 'custom error message');
```

### Streaming Results

The query methods above return fully materialized results. To evalute a query and return a stream of results, use `evaluateStreamingQuery` or `evaluateStreamingPreparedStatement`:

```ts
const result = await connection.evaluateStreamingQuery(sql);
```

See [Results](#results) below for the structure of the result object.

### Error Handling

The query result promises returned by `evaluateQuery`, `evaluatePreparedStatement`, `evaluateQueuedQuery`, and `evaluateStreamingQuery` will be rejected in the case of an error.

For convenience, "safe" variants of these three method are provided that catch this error and always resolve to a value indicating success or failure. For example:

```ts
const result = await connection.saveEvaluateQuery(sql);
if (result.status === 'success') {
  console.log('rows', result.rows);
} else {
  console.log('error', result.err);
}
```

### Results

A successful query result may either be fully materialized, or it may contain a stream.

Use the `type` property of the result object, which is either `'materialized'` or `'streaming'`, to distinguish these.

#### Materialized Results

A materialized result contains a `rows` property, which is an array of row objects.
Each row object has one property per column, named after that column. (Multiple columns with the same name are not currently supported.)
The type of each column property of a row object depends on the type of the corresponding column in DuckDB.

Many values are converted to a JavaScript primitive type, such as `boolean`, `number`, or `string`.
Some numeric values too large to fit in a JavaScript `number` (e.g a DuckDB [BIGINT](https://duckdb.org/docs/sql/data_types/numeric#integer-types)) are converted to a JavaScript `bigint`.
Values may also be JavaScript arrays or objects, for nested types such as DuckDB [LIST](https://duckdb.org/docs/sql/data_types/list) or [MAP](https://duckdb.org/docs/sql/data_types/map).
Some DuckDB types, such as [DATE](https://duckdb.org/docs/sql/data_types/date), [TIME](https://duckdb.org/docs/sql/data_types/time), [TIMESTAMP](https://duckdb.org/docs/sql/data_types/timestamp), and [DECIMAL](https://duckdb.org/docs/sql/data_types/numeric#fixed-point-decimals), are converted to JavaScript objects implementing an interface specific to that type.

These objects all implement `toString` to return a string representation identical to DuckDB's string conversion (e.g. using [CAST](https://duckdb.org/docs/sql/expressions/cast.html) to VARCHAR).
They also have properties exposing the underlying value. For example, the object for a DuckDB TIME has a `microseconds` property (of type `bigint`). See the TypeScript type definitions for details.

Note that these result types differ from those returned by DuckDB WASM without the MotherDuck WASM Client library. The MotherDuck WASM Client library implements custom conversion logic to preserve the full range of some types.

#### Streaming Results

A streaming result contains a `streamReader` property, which provides access to the underlying Arrow RecordBatch stream reader.
This stream reader implements the async iterator protocol, and also has convenience methods such as `readAll` to materialize all batches.
This can be useful if you need the underlying Arrow representation.

Note, however, that Arrow performs sometimes lossy conversion of the underlying data to JavaScript types for certain DuckDB types, especially dates, times, and decimals.
Also, converting Arrow values to strings will not always match DuckDB's string conversion.

Finally, note that results of remote queries are not streamed end-to-end yet.
Results of remote queries are fully materialized on the client upstream of this API.
So the first batch will not be returned from this API until all results have been received by the client.
End-to-end streaming of remote query results is on our roadmap.
