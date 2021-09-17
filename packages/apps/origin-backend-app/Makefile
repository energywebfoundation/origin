PROJECT				= origin-backend-app

NAME   				= energyweb/${PROJECT}
TAG_CANARY    := $(shell yarn info @energyweb/${PROJECT}@canary --json dist-tags.canary | jq -r .data)
TAG_LATEST    := $(shell yarn info @energyweb/${PROJECT} --json dist-tags.latest | jq -r .data)
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-local:
	@docker build -t ${NAME}:local -f Dockerfile ../../

build-canary:
	@rm -rf ./deployment
	@mkdir ./deployment
	@rush deploy -p @energyweb/origin-backend-app -t ./deployment --overwrite
	@docker rmi ${LATEST} -f
	@docker build -t ${NAME}:${TAG_CANARY} --build-arg VERSION=${TAG_CANARY} -f Dockerfile ./deployment
	@rm -rf ./deployment
	@docker tag ${NAME}:${TAG_CANARY} ${CANARY}

build-latest:
	@rm -rf ./deployment
	@mkdir ./deployment
	@rush deploy -p @energyweb/origin-backend-app -t ./deployment --overwrite
	@docker rmi ${LATEST} -f
	@docker build -t ${NAME}:${TAG_LATEST} --build-arg VERSION=${TAG_LATEST} -f Dockerfile ./deployment
	@rm -rf ./deployment
	@docker tag ${NAME}:${TAG_LATEST} ${LATEST}
