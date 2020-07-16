# Docker for development

The Dockerfile and docker-compose are configured for development purposes only, not intended for use in production.

Run:

`$ docker-compose build`

Then to migrate databases:

`$ docker-compose run app node /home/app/src/bin/migrate-database.js`

And any of the other app commands:

```
$ docker-compose run app node /home/app/src/bin/spider-data-catalog.js
$ docker-compose run app node /home/app/src/bin/download-raw.js
// etc.
```

To access the database with psql:

```
$ docker-compose exec postgres psql -U app -h postgres
$ // (password is 'app')
```

Database will persist between container restarts/rebuilds.

The web application starts with `docker-compose up -d`. The API should be available at "localhost:3000".
