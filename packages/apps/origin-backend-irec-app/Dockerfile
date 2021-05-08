FROM node:16-alpine

ARG VERSION=latest

RUN apk --no-cache add make gcc g++ python bash
RUN npm i -g yarn --force
RUN mkdir -p /var/db

RUN for i in 1 2 3 4 5; do yarn global add @energyweb/origin-backend-irec-app@${VERSION} && break || sleep 15; done

CMD ["/bin/bash", "-c", "origin-backend-irec-app"]