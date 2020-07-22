# Heroku for production

## Initial Setup

Create a new app.

Add the "Heroku Postgres" addition. The free level only has 10,000 rows - we recommend you don't use that level.

Make sure the database is set as "Attach as DATABASE". 
If you go to "Settings" and "Reveal Config Vars" you should see details for it as "DATABASE_URL".

Do a deploy. If you link your GitHub account you can press a button in the web interface to do this, or you set up the heroku CLI tool. 
Either is fine.

Select More, Run Command and put in "node ./src/bin/migrate-database.js". Wait for this to finish.

Select More, and "Restart all dynos". (This is so the code starts again with the correct database structure)

Go to Resources - the "worker" Dyno should be enabled.

That's it!

## Updating app

Go to Resources - disable the "worker" Dyno.

Deploy the latest code.

If you link your GitHub account you can press a button in the web interface to do this, or you set up the heroku CLI tool. 
Either is fine.

Select More, Run Command and put in "node ./src/bin/migrate-database.js". Wait for this to finish.

Select More, and "Restart all dynos". (This is so the code starts again with the correct database structure)

Go to Resources - the "worker" Dyno should be enabled again.

