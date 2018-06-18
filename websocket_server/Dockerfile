FROM alpine:3.7

RUN apk update && \
    apk add nodejs=8.9.3-r1 nodejs-npm=8.9.3-r1

WORKDIR /srv/node-app

RUN npm i -g npm

COPY ./package.json .

RUN npm i

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
