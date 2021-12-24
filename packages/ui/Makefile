PROJECT				= origin-ui

NAME   				= energyweb/${PROJECT}
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary
STORYBOOK     = energyweb/origin-ui-core:storybook

build-canary:
	@docker build --file ./docker/ui/Dockerfile -t ${CANARY} .

build-latest:
	@docker build --file ./docker/ui/Dockerfile --no-cache -t ${LATEST} .

build-storybook:
	@docker build --file ./docker/sb/Dockerfile --no-cache -t ${STORYBOOK} .

push-heroku-canary:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${CANARY} registry.heroku.com/${HEROKU_CANARY_APP_UI}/web
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_UI}/web
	@heroku container:release web -a ${HEROKU_CANARY_APP_UI}
endif

push-heroku-stable:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${LATEST} registry.heroku.com/${HEROKU_STABLE_APP_UI}/web
	@docker push registry.heroku.com/${HEROKU_STABLE_APP_UI}/web
	@heroku container:release web -a ${HEROKU_STABLE_APP_UI}
endif

push-heroku-storybook:
ifdef HEROKU_API_KEY
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com

	@docker tag ${STORYBOOK} registry.heroku.com/${HEROKU_STORYBOOK_APP}/web
	@docker push registry.heroku.com/${HEROKU_STORYBOOK_APP}/web
	@heroku container:release web -a ${HEROKU_STORYBOOK_APP}
endif
