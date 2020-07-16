PROJECT				= solar-simulator

NAME   				= energyweb/${PROJECT}
TAG_CANARY    = $(shell yarn info @energyweb/${PROJECT}@canary --json dist-tags.canary | jq -r .data)
TAG_LATEST    = $(shell yarn info @energyweb/${PROJECT} --json dist-tags.latest | jq -r .data)
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-canary:
	@docker build -t ${NAME}:${TAG_CANARY} --build-arg VERSION=${TAG_CANARY} .
	@docker tag ${NAME}:${TAG_CANARY} ${CANARY}

build-latest:
	@docker build --no-cache -t ${NAME}:${TAG_LATEST} .
	@docker tag ${NAME}:${TAG_LATEST} ${LATEST}

push:
ifdef DOCKER_USER
	@docker login -u ${DOCKER_USER} -p $(shell echo '$$DOCKER_PASS')
	@docker push ${NAME}
endif

push-heroku-canary:
ifdef HEROKU_API_KEY
	@docker tag ${CANARY} registry.heroku.com/${HEROKU_CANARY_APP_SIM}/worker
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_SIM}/worker
	@heroku container:release worker -a ${HEROKU_CANARY_APP_SIM}
endif

push-heroku-stable:
ifdef HEROKU_API_KEY
	@docker pull ${LATEST}
	@docker tag ${LATEST} registry.heroku.com/${HEROKU_STABLE_APP_SIM}/worker
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_STABLE_APP_SIM}/worker
	@heroku container:release worker -a ${HEROKU_STABLE_APP_SIM}
endif