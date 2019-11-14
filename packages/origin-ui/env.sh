#!/bin/bash

REQUIRED_VARIABLES=(
  MODE
  WEB3
  BACKEND_URL
  BLOCKCHAIN_EXPLORER_URL
)

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment 
echo "window._env_ = {" >> ./env-config.js

envToRead=.env
rootEnvFile=../../.env
if [ ! -e "$envToRead" ]; then
    envToRead=$rootEnvFile
fi 

for i in "${REQUIRED_VARIABLES[@]}"
  do
    varname="$i"
    value=$(printf '%s\n' "${!varname}")

    if [ -z "$value" ]; then
      if test -f $rootEnvFile; then
        value=$(grep -e '^'$varname'=.*' $rootEnvFile | cut -d '=' -f2 | xargs)    
      fi
    fi

    echo "    $varname: \"$value\"," >> ./env-config.js
  done

echo "};" >> ./env-config.js