FROM node:8.12

WORKDIR /app

ENV NODE_ENV=production

ADD ./package.json .

ADD ./yarn.lock .

ADD ./docker-entry.sh .

RUN yarn install

ADD ./public/*.* ./public/

ADD ./server/*.js ./server/

RUN groupadd -g 1097 mousebrainmicro
RUN adduser -u 7700649 --disabled-password --gecos '' mluser
RUN usermod -a -G mousebrainmicro mluser

USER mluser

CMD ["./docker-entry.sh"]

EXPOSE  3100
