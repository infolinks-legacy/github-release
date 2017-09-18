FROM node:8.5.0-alpine
MAINTAINER Arik Kfir <arik@infolinks.com>
ENV NODE_ENV production
ADD update-release-notes.js package.json /usr/local/app/
WORKDIR /usr/local/app/
RUN npm install && chmod a+x /usr/local/app/update-release-notes.js
USER node
ENTRYPOINT ["/usr/local/app/update-release-notes.js"]
