# Live Hosting on Heroku

## Initial Setup

Create a new app in the "Europe" region.

Add the "Heroku Postgres" addition. The free level only has 10,000 rows - we recommend you use a paid level as the database can grow quickly.

Make sure the database is set as "Attach as DATABASE". If you go to "Settings" and "Reveal Config Vars" you should see details for it as "DATABASE\_URL".

If using production (>= standard-0) postgres addon plan you must also add and set the Config var `DATABASE_USE_SSL` to "true".

Do a deploy. You must do this by setting up the heroku CLI tool and a "git push" operation. \(This is because we use submodules, and that only works with a push: [https://devcenter.heroku.com/articles/git-submodules\#git-submodules](https://devcenter.heroku.com/articles/git-submodules#git-submodules) \)

From the App dashboard select "More", "Run Console" and run the command `node ./src/bin/migrate-database.js`. After this has completed, Select "More", and "Restart all dynos". \(This is so the code starts again with the correct database structure\)

Go to Resources - the "worker" Dyno should be enabled.

That's it!

## Updating app

Go to Resources - disable the "worker" Dyno.

Deploy the latest code. You must do this by setting up the heroku CLI tool and a "git push" operation. \(This is because we use submodules, and that only works with a push: [https://devcenter.heroku.com/articles/git-submodules\#git-submodules](https://devcenter.heroku.com/articles/git-submodules#git-submodules) \)

Select More, Run Command and put in "node ./src/bin/migrate-database.js". Wait for this to finish.

Select More, and "Restart all dynos". \(This is so the code starts again with the correct database structure\)

Go to Resources - the "worker" Dyno should be enabled again.

