FROM nginx:alpine

COPY ./dist/storybook /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

CMD nginx -g 'daemon off;'
