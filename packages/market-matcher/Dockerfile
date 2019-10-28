FROM node:12-alpine

RUN apk --no-cache add make gcc g++ python
RUN npm i -g yarn
RUN yarn global add @energyweb/market-matcher@canary

CMD ["market-matcher"]