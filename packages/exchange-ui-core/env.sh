#!/bin/bash

REQUIRED_VARIABLES=(
  DEFAULT_ENERGY_IN_BASE_UNIT
  EXCHANGE_WALLET_PUB
)

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "{" >> ./env-config.js

envToRead=.env
rootEnvFile=../../.env
if [ ! -e "$envToRead" ]; then
    envToRead=$rootEnvFile
fi

pos=$(( ${#REQUIRED_VARIABLES[*]} - 1 ))
last=${REQUIRED_VARIABLES[$pos]}

for i in "${REQUIRED_VARIABLES[@]}"
  do
    varname="$i"
    value=$(printf '%s\n' "${!varname}")

    if [ -z "$value" ]; then
      if test -f $rootEnvFile; then
        value=$(grep -e '^'$varname'=.*' $rootEnvFile | cut -d '=' -f2 | xargs)
      fi
    fi

    if [[ $i == $last ]]; then
        echo "    \"$varname\": \"$value\"" >> ./env-config.js
      else
        echo "    \"$varname\": \"$value\"," >> ./env-config.js
    fi
  done

echo "}" >> ./env-config.js