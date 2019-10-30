PROJECT				= origin-ui

NAME   				= energyweb/${PROJECT}
LATEST 				= ${NAME}:latest
CANARY 				= ${NAME}:canary

build-canary:
	@docker build --no-cache -t ${CANARY} .

build-latest:
	@docker build --no-cache -t ${LATEST} .

push:
ifdef DOCKER_USER
	@docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
	@docker push ${NAME}
endif