FROM energyweb/origin-backend-irec-app:latest

RUN mkdir /var/migration-config
COPY config/* /var/migration-config/

WORKDIR /usr/local/share/.config/yarn/global/node_modules/\@energyweb/

CMD ["/bin/bash","-c", "origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config exchange/dist/js/ormconfig.js && \ 
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-backend/dist/js/ormconfig.js && \ 
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-organization-irec-api/dist/js/ormconfig.js && \ 
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config issuer-api/dist/js/ormconfig.js && \ 
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-device-registry-irec-local-api/dist/js/ormconfig.js && \ 
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-device-registry-api/dist/js/ormconfig.js && \
                        migrations-irec/bin/migrations-irec -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql && \
                        origin-backend-irec-app"]