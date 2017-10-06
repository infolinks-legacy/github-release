FROM node:8.5.0-alpine
MAINTAINER Arik Kfir <arik@infolinks.com>
ARG rel=unknown
ENV NODE_ENV production
WORKDIR /usr/local/lib/github-release/
COPY package.json /usr/local/lib/github-release/
RUN npm install
COPY ./src/*.js /usr/local/lib/github-release/
RUN chmod a+x ./update-release-notes.js && echo "${rel}" > ./release
USER node
ENTRYPOINT ["/usr/local/lib/github-release/update-release-notes.js"]
