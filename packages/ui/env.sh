#!/bin/bash

REQUIRED_VARIABLES=(
  MODE
  WEB3
  BACKEND_URL
  BLOCKCHAIN_EXPLORER_URL
  REGISTRATION_MESSAGE_TO_SIGN
  ISSUER_ID
  DEVICE_PROPERTIES_ENABLED
  DEFAULT_ENERGY_IN_BASE_UNIT
  EXCHANGE_WALLET_PUB
  GOOGLE_MAPS_API_KEY
  MARKET_UTC_OFFSET
  DISABLED_UI_FEATURES
  SMART_METER_ID
)

# Recreate config file
rm -rf ./.local.env
touch ./.local.env

# Add assignment

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
      if test -f $envToRead; then
        value=$(grep -e '^'$varname'=.*' $envToRead | cut -d '=' -f2 | xargs)
      fi
    fi

    if [[ $i == $last ]]; then
        echo "NX_$varname=$value" >> ./.local.env
      else
        echo "NX_$varname=$value" >> ./.local.env
    fi
  done

