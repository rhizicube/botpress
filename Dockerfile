FROM node:12

RUN   apt-get install -y git

WORKDIR /bp

COPY ./ ./
RUN ls 
WORKDIR /bp/botpress
RUN ls 
RUN  yarn
RUN   yarn build 
RUN   yarn add body-parser -W
RUN    yarn add express -W
RUN   rm -fR "/usr/local/share/.cache/yarn/v6/npm-asteroid*/node_modules/asteroid/test"
RUN  yarn package