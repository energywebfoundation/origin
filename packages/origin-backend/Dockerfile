FROM node:12-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python
RUN npm i -g yarn
RUN mkdir -p /var/db && touch /var/db/db.sqlite

RUN yarn global add @energyweb/origin-backend@${VERSION}

CMD ["origin-backend"]