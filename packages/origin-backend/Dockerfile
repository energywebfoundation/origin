FROM node:12-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python bash
RUN npm i -g yarn
RUN mkdir -p /var/db

RUN yarn global add @energyweb/origin-backend@${VERSION}

CMD ["/bin/bash", "-c", "touch /var/db/db.sqlite && origin-backend"]