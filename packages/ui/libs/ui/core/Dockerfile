FROM nginx:alpine

COPY ./dist/storybook /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

WORKDIR /usr/share/nginx/html
