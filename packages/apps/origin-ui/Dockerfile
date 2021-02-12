FROM nginx:alpine

RUN apk add --no-cache bash

COPY dist/* /usr/share/nginx/html/
COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

COPY env.sh /usr/share/nginx/html

RUN chmod +x /usr/share/nginx/html/env.sh

WORKDIR /usr/share/nginx/html

CMD ["/bin/bash", "-c", "DOLLAR='$' envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && ./env.sh && nginx -g \"daemon off;\""]
