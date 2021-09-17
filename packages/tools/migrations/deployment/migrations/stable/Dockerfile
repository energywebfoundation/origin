FROM energyweb/origin-backend-app:latest

RUN apk --no-cache add curl

RUN mkdir -p /var/deployment
COPY ./ /var/deployment

WORKDIR /var/deployment/packages/

CMD ["/bin/bash","-c", "apps/origin-backend-app/node_modules/.bin/typeorm migration:run --config trade/exchange/dist/js/ormconfig.js && \
                        apps/origin-backend-app/node_modules/.bin/typeorm migration:run --config origin-backend/dist/js/ormconfig.js && \
                        apps/origin-backend-app/node_modules/.bin/typeorm migration:run --config organizations/origin-organization-irec-api/dist/js/ormconfig.js && \
                        apps/origin-backend-app/node_modules/.bin/typeorm migration:run --config traceability/issuer-api/dist/js/ormconfig.js && \
                        cd tools/migrations/bin && \
                        ./migrations -c /var/deployment/config/demo-config.json -s /var/deployment/config/seed.sql && \
                        cd - && \
                        tools/migrations/node_modules/.bin/origin-backend-app"]
