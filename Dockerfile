FROM node:10-alpine

USER root

RUN apk add --no-cache make gcc g++ openssh-client
RUN apk add --no-cache python && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -r /root/.cache
RUN apk add --no-cache git && \
    npm config set unsafe-perm true && \
    npm install -g yarn

WORKDIR /dockerBuildDirectory
COPY . /dockerBuildDirectory

RUN yarn
RUN yarn build:full