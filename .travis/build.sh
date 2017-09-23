#!/usr/bin/env bash

set -e

docker build -t infolinks/github-release:${TRAVIS_COMMIT} .

if [[ ${TRAVIS_TAG} =~ ^v[0-9]+$ ]]; then
    docker tag infolinks/github-release:${TRAVIS_COMMIT} infolinks/github-release:${TRAVIS_TAG}
    docker push infolinks/github-release:${TRAVIS_TAG}
    docker tag infolinks/github-release:${TRAVIS_COMMIT} infolinks/github-release:latest
    docker push infolinks/github-release:latest
fi
