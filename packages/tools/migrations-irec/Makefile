PROJECT				= migrations-heroku

NAME   				= energyweb/${PROJECT}
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-canary:
	@docker build -f deployment/migrations/canary/Dockerfile -t ${CANARY} .

build-stable:
	@docker build --no-cache -f deployment/migrations/stable/Dockerfile -t ${LATEST} .

push-heroku-canary:
ifdef HEROKU_API_KEY
	@docker tag ${CANARY} registry.heroku.com/${HEROKU_CANARY_APP_IREC_API}/web
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_IREC_API}/web
	@heroku container:release web -a ${HEROKU_CANARY_APP_IREC_API}
endif

push-heroku-stable:
ifdef HEROKU_API_KEY
	@docker tag ${LATEST} registry.heroku.com/${HEROKU_STABLE_APP_IREC_API}/web
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_STABLE_APP_IREC_API}/web
	@heroku container:release web -a ${HEROKU_STABLE_APP_IREC_API}
endif