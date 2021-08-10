#!/bin/bash

# Replaces nginx config with env variables
DOLLAR='$' envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Replaces index.html with env variables
cp ./index.html ./index.html.template # Copy is necessary, because otherwise we get empty file after envsubst
envsubst < ./index.html.template > ./index.html

nginx -g "daemon off;"
