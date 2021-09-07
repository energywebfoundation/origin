FROM nginx:alpine

RUN apk add --no-cache bash

COPY ./dist/apps/origin-ui/ /usr/share/nginx/html/
COPY ./apps/origin-ui/nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

WORKDIR /usr/share/nginx/html

COPY ./prod-start.sh .
RUN chmod +x ./prod-start.sh

CMD ["/bin/bash", "./prod-start.sh"]
