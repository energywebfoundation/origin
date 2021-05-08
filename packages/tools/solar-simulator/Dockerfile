FROM node:16-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python
RUN npm i -g yarn --force
RUN for i in 1 2 3 4 5; do yarn global add @energyweb/solar-simulator@${VERSION} && break || sleep 15; done

CMD ["solar-simulator"]