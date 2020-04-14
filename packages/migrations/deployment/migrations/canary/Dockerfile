FROM energyweb/origin-backend-app:canary

RUN mkdir /var/migration-config
COPY config/* /var/migration-config/

WORKDIR /usr/local/share/.config/yarn/global/node_modules/\@energyweb/migrations/bin

CMD ["/bin/bash","-c", "./migrations -c /var/migration-config/demo-config.json -s /var/migration-config/seed.sql && origin-backend-app"]