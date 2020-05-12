#!/bin/bash

heroku config:set --app ${APP} SOLAR_SIMULATOR_DEPLOY_PAST_READINGS=true
sleep 60
heroku config:set --app ${APP} SOLAR_SIMULATOR_DEPLOY_PAST_READINGS=false