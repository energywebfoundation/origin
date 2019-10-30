FROM node:12-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python
RUN npm i -g yarn

RUN yarn global add @energyweb/origin-backend@${VERSION}

CMD ["origin-backend"]