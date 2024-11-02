FROM node:20.18.0-alpine

RUN apk update --no-cache && apk add bash --no-cache
RUN apk upgrade --no-cache

COPY . .

RUN npm ci
RUN npm run build

CMD ["/bin/bash", "./bash.sh"]