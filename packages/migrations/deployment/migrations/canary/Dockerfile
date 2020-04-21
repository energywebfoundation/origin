FROM energyweb/origin-backend-app:canary

RUN mkdir /var/migration-config
COPY config/* /var/migration-config/

RUN yarn global add typeorm
RUN yarn global add pg

WORKDIR /usr/local/share/.config/yarn/global/node_modules/\@energyweb/

CMD ["/bin/bash","-c", "typeorm migration:run --config exchange/dist/js/ormconfig.js && typeorm migration:run --config origin-backend/dist/js/ormconfig.js && migrations/bin/migrations -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql && origin-backend-app"]