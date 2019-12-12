FROM node:12-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python bash
RUN npm i -g yarn
RUN mkdir -p /var/db

RUN for i in 1 2 3 4 5; do yarn global add @energyweb/origin-backend@${VERSION} && break || sleep 15; done

CMD ["/bin/bash", "-c", "touch /var/db/db.sqlite && origin-backend"]