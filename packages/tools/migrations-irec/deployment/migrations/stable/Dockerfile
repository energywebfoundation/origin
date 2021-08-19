FROM energyweb/origin-backend-irec-app:latest

RUN apk --no-cache add curl

RUN mkdir /var/migration-config
COPY config/* /var/migration-config/

WORKDIR /usr/local/share/.config/yarn/global/node_modules/@energyweb/

CMD ["/bin/bash","-c", "origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config exchange/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-backend/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-organization-irec-api/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config issuer-api/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config issuer-irec-api/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-device-registry-irec-local-api/dist/js/ormconfig.js && \
                        origin-backend-irec-app/node_modules/.bin/typeorm migration:run --config origin-device-registry-api/dist/js/ormconfig.js && \
                        #TODO: remove fallback to the old script filenames after released modules are updated \
                        (migrations-irec/bin/migrations-irec -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql || migrations-irec/bin/migrations -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql) && \
                        (origin-backend-irec-app || origin-backend-app)"]