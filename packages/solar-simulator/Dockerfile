FROM node:10-alpine

USER root

RUN apk add --no-cache make gcc g++ openssh-client
RUN apk add --no-cache python git && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -r /root/.cache

COPY package.json /tmp/package.json
RUN cd /tmp && rm -rf /tmp/node_modules/websocket && npm config set unsafe-perm true && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src

WORKDIR /src
COPY . /src

RUN node scripts/build.js