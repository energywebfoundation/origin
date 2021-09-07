PROJECT				= migrations

NAME   				= energyweb/${PROJECT}
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-canary:
	@rm -rf ./deployment/migrations/canary/deployment
	@mkdir ./deployment/migrations/canary/deployment
	@rush deploy -p @energyweb/migrations -t ./deployment/migrations/canary/deployment --overwrite
	@cp -r ./config ./deployment/migrations/canary/deployment/config
	@docker rmi ${LATEST} -f
	@docker build -f deployment/migrations/canary/Dockerfile -t ${CANARY} ./deployment/migrations/canary/deployment
	@rm -rf ./deployment/migrations/canary/deployment

build-stable:
	@rm -rf ./deployment/migrations/stable/deployment
	@mkdir ./deployment/migrations/stable/deployment
	@rush deploy -p @energyweb/migrations -t ./deployment/migrations/stable/deployment --overwrite
	@cp -r ./config ./deployment/migrations/stable/deployment/config
	@docker rmi ${LATEST} -f
	@docker build -f deployment/migrations/stable/Dockerfile -t ${LATEST} ./deployment/migrations/stable/deployment
	@rm -rf ./deployment/migrations/stable/deployment

push-heroku-canary:
ifdef HEROKU_API_KEY
	@docker tag ${CANARY} registry.heroku.com/${HEROKU_CANARY_APP_API}/web
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_CANARY_APP_API}/web
	@heroku container:release web -a ${HEROKU_CANARY_APP_API}
endif

push-heroku-stable:
ifdef HEROKU_API_KEY
	@docker tag ${LATEST} registry.heroku.com/${HEROKU_STABLE_APP_API}/web
	@docker login -u _ -p $(shell echo '$$HEROKU_API_KEY') registry.heroku.com
	@docker push registry.heroku.com/${HEROKU_STABLE_APP_API}/web
	@heroku container:release web -a ${HEROKU_STABLE_APP_API}
endif
