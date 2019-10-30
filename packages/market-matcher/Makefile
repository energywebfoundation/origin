PROJECT				= market-matcher

NAME   				= energyweb/${PROJECT}
TAG_CANARY    = $(shell yarn info @energyweb/${PROJECT}@canary --json dist-tags.canary | jq -r .data) 
TAG_LATEST    = $(shell yarn info @energyweb/${PROJECT} --json dist-tags.latest | jq -r .data) 
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary
 
build-canary:
	@docker build -t ${NAME}:${TAG_CANARY} --build-arg VERSION=${TAG_CANARY}.
	@docker tag ${NAME}:${TAG_CANARY} ${CANARY}

build-latest:
	@docker build --no-cache -t ${NAME}:${TAG_LATEST} .
	@docker tag ${NAME}:${TAG_LATEST} ${LATEST}

push:
ifdef DOCKER_USER
	@docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
	@docker push ${NAME}
endif