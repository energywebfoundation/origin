PROJECT				= origin-ui

NAME   				= energyweb/${PROJECT}
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary
CANARY-V2     = ${NAME}:canary-v2

build-canary:
	@docker build -t ${CANARY} .

build-canary-v2:
	@docker buildx build --platform linux/amd64 -t ${CANARY-V2} .

build-latest:
	@docker build --no-cache -t ${LATEST} .

push-heroku-canary:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${CANARY} registry.heroku.com/${HEROKU_CANARY_APP_UI}/web
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_UI}/web
	@heroku container:release web -a ${HEROKU_CANARY_APP_UI}
endif

push-heroku-canary-v2:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${CANARY-V2} registry.heroku.com/${HEROKU_CANARY_APP_UI_V2}/web
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_UI_V2}/web
	@heroku container:release web -a ${HEROKU_CANARY_APP_UI_V2}
endif

push-heroku-stable:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${LATEST} registry.heroku.com/${HEROKU_STABLE_APP_UI}/web
	@docker push registry.heroku.com/${HEROKU_STABLE_APP_UI}/web
	@heroku container:release web -a ${HEROKU_STABLE_APP_UI}
endif
