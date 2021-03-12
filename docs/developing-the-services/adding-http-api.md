# Adding http API

Additional http API can be added to the existing [webserver component](../http-apis.md).

## web-server

`lib/web-server.js` contains the routing and view for the webserver. A simple example of a new entry to add `/raw_data?limit=30` would be:

```js
/* This provide /raw_data with any optional ?limit= query parameter */
web_server_app.get('/raw_data', async (req, res) => {
  let result = WebDeveloperAPI.getRaw(req.query.limit);
  if (result !== false){
    res.json(result);
  } else {
    internalServerError(res);
  }
});
```

To keep `lib/web-server.js` as easy to read as possible more involved responses should be added to `lib/web-developer-api.js`. An example would be added as a static function to the `WebDeveloperAPI` class.

Continuing the above example, the function needed in `WebDeveloperAPI` would be:

```js
static async getRawData(limit){
  /* Set a default limit if undefined */
  if (limit === undefined){
    limit = 50;
  }

  let result = false;
  const client = await database_pool.connect();
  try {
    /* Run the SQL query */
    result = await client.query('SELECT data FROM raw_data LIMIT $1', [limit]);
  } catch(err) {
    console.warn(err);
  } finally {
    /* Make sure to always release the database client */
    client.release();
  }
}

```

Always make sure to use the SQL query template mechanism rather than passing any values directly into the SQL query string.


