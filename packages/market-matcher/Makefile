NAME   = energyweb/market-matcher
TAG    = $(shell yarn info @energyweb/market-matcher@canary --json dist-tags.canary | jq -r .data) 
IMG    = ${NAME}:${TAG}
LATEST = ${NAME}:latest
 
build-image:
	@docker build -t ${IMG} .
	@docker tag ${IMG} ${LATEST}

push:
	@docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
	@docker push ${NAME}