FROM node:10-alpine

USER root

RUN apk add --no-cache make gcc g++ openssh-client
RUN apk add --no-cache python && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -r /root/.cache
RUN apk add --no-cache git

COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
RUN cd /tmp && rm -rf /tmp/node_modules/websocket/.git && npm config set unsafe-perm true && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src

WORKDIR /src
COPY . /src