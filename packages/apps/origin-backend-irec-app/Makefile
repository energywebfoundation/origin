PROJECT				= origin-backend-irec-app

NAME   				= energyweb/${PROJECT}
TAG_CANARY    := $(shell yarn info @energyweb/${PROJECT}@canary --json dist-tags.canary | jq -r .data)
TAG_LATEST    := $(shell yarn info @energyweb/${PROJECT} --json dist-tags.latest | jq -r .data)
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-local:
	@docker build -t ${NAME}:local -f Dockerfile.local ../../

build-canary:
	@rm -rf ./deployment
	@mkdir ./deployment
	@rush deploy -p @energyweb/origin-backend-irec-app -t ./deployment --overwrite
	@docker rmi ${LATEST} -f
	@docker build -t ${NAME}:${TAG_CANARY} --build-arg VERSION=${TAG_CANARY} -f Dockerfile.local ./deployment
	@rm -rf ./deployment
	@docker tag ${NAME}:${TAG_CANARY} ${CANARY}

build-latest:
	@docker build --no-cache -t ${NAME}:${TAG_LATEST} .
	@docker tag ${NAME}:${TAG_LATEST} ${LATEST}
