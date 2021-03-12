# Deploying the service to a Dokku instance

Requirements:

Dokku instance setup on a server. [See dokku docs for installation](https://dokku.com/docs/getting-started/installation/#installing-the-latest-stable-version). Alternatively use a Dokku hosting provider.

A Postgresql 12 database.

# Create the application

On the dokku server run:

```
$ dokku apps:create conformance-services
$ ddkku config:set conformance-services DATABASE_URL=postgres://example_user:example_pass@example_host/example_databasename
```

Once complete you will now need to push the conformance-services code to the dokku application.

On any machine with the correct access to the dokku server:

```
$ git clone https://github.com/openactive/conformance-services.git
$ git add remote add dokku dokku@dokku-server.exmple.com
$ git push dokku master
```

## Scheduled tasks

To run scheduled tasks add them to the cron service on the dokku server.

The following jobs are suggested:

```
*/30 * * * * dokku run conformance-services "node ./src/bin/spider-data-catalog.js"
*/30 * * * * dokku run conformance-services "node ./src/bin/update-publisher-feed-stats.js"
*/30 * * * * dokku run conformance-services "node ./src/bin/clean-up-database.js"
0 0 * * * dokku run conformance-services "node ./src/bin/clean-up-database.js all"
```

To optionally log the output of these redirect the output to a file. For example:

`dokku run conformance-services "node ./src/bin/clean-up-database.js" >> /var/log/conformance-services/cron.log 2>&1`

## Scaling the number of workers

The number of worker processes by default is one per worker, this will result in one validator, downloader, normaliser and web worker as defined in the `Procfile`.Depending on the resources available it may be beneficial to scale these up.

To change the number of worker processes, on the dokku server run:

```
$ dokku ps:scale conformance-services validator-worker=2 normaliser-worker=2
```

Note that only the validator and normaliser can run in parallel. Other tasks such as spidering the data catalog and downloading raw data are designed as single processes.

## Useful Dokku commands

Read the output logs:
```
 dokku logs conformance-services -t
```

Show the status of the processes:
```
 dokku ps:report conformance-services
```


Restart the application:
```
dokku ps:restart conformance-services --parallel -1
```