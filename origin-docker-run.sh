#!/bin/bash

mkdir -p db
docker-compose pull
docker-compose up -d