FROM nginx:alpine

RUN apk add --no-cache bash

COPY ../../dist/storybook/ui-core /usr/share/nginx/html/
COPY ../../nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

WORKDIR /usr/share/nginx/html
