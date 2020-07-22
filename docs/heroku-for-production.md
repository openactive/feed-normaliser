# Heroku for production

## Initial Setup

Create a new app in the "Europe" region.

Add the "Heroku Postgres" addition. The free level only has 10,000 rows - we recommend you don't use that level.

Make sure the database is set as "Attach as DATABASE". 
If you go to "Settings" and "Reveal Config Vars" you should see details for it as "DATABASE_URL".

Do a deploy. You must do this by setting up the heroku CLI tool and a "git push" operation.
(This is because we use submodules, and that only works with a push: https://devcenter.heroku.com/articles/git-submodules#git-submodules )

Select More, Run Command and put in "node ./src/bin/migrate-database.js". Wait for this to finish.

Select More, and "Restart all dynos". (This is so the code starts again with the correct database structure)

Go to Resources - the "worker" Dyno should be enabled.

That's it!

## Updating app

Go to Resources - disable the "worker" Dyno.

Deploy the latest code. You must do this by setting up the heroku CLI tool and a "git push" operation.
(This is because we use submodules, and that only works with a push: https://devcenter.heroku.com/articles/git-submodules#git-submodules )

Select More, Run Command and put in "node ./src/bin/migrate-database.js". Wait for this to finish.

Select More, and "Restart all dynos". (This is so the code starts again with the correct database structure)

Go to Resources - the "worker" Dyno should be enabled again.

