FROM node:8.5.0-alpine
MAINTAINER Arik Kfir <arik@infolinks.com>
ENV NODE_ENV production
ADD update-release-notes.js package.json /usr/local/lib/github-release/
ARG rel=unknown
RUN npm install && \
    chmod a+x /usr/local/lib/github-release/update-release-notes.js && \
    echo "${rel}" > /usr/local/lib/github-release/release
USER node
ENTRYPOINT ["/usr/local/lib/github-release/update-release-notes.js"]
