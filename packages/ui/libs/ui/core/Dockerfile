FROM nginx:alpine

COPY ./dist/storybook /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf

CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
