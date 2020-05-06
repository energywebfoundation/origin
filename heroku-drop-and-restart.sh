#!/bin/bash

heroku ps:scale web=0 -a ${APP}
heroku pg:psql -a ${APP} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
heroku ps:scale web=1 -a ${APP}