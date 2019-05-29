
FROM node:10-alpine

USER root

RUN apk add --no-cache git openssh-client

COPY package.json /tmp/package.json
RUN cd /tmp && npm config set unsafe-perm true && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src

WORKDIR /src
COPY . /src

RUN npm run build
