FROM nginx:alpine

RUN apk add --no-cache bash

COPY dist/* /var/www/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY env.sh /var/www/html

RUN chmod +x /var/www/html/env.sh

WORKDIR /var/www/html

CMD ["/bin/bash", "-c", "/var/www/html/env.sh && nginx -g \"daemon off;\""]