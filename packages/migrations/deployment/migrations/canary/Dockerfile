FROM energyweb/origin-backend-app:canary

RUN mkdir /var/migration-config
COPY config/* /var/migration-config/

RUN yarn global add typeorm
RUN yarn global add pg

WORKDIR /usr/local/share/.config/yarn/global/node_modules/\@energyweb/origin-backend-app/node_modules/.bin

CMD ["/bin/bash","-c", "./origin-exchange-migrate && ./origin-backend-migrate && ./origin-migrations -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql && origin-backend-app"]