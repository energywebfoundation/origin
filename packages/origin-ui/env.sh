#!/bin/bash

REQUIRED_VARIABLES=(
  MODE
  WEB3
  BACKEND_URL
  BLOCKCHAIN_EXPLORER_URL
)

containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

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

if [ -e "$envToRead" ]; then
  # Read each line in .env file
  # Each line represents key=value pairs
  while read -r line || [[ -n "$line" ]];
  do
    # Split env variables by character `=`
    if printf '%s\n' "$line" | grep -q -e '='; then
      varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')

      if containsElement "$varname" "${REQUIRED_VARIABLES[@]}"; then
        varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')

        # Read value of current variable if exists as Environment variable
        value=$(printf '%s\n' "${!varname}")
        # Otherwise use value from .env file
        [[ -z $value ]] && value=${varvalue}
        
        # Append configuration property to JS file
        echo "    $varname: \"$value\"," >> ./env-config.js
      fi
    fi
  done < $envToRead
else
  for i in "${REQUIRED_VARIABLES[@]}"
  do
    varname="$i"
    value=$(printf '%s\n' "${!varname}")
    echo "    $varname: \"$value\"," >> ./env-config.js
  done
fi 

echo "};" >> ./env-config.js