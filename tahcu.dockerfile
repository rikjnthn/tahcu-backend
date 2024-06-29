FROM node:22.2.0-alpine

COPY . .

RUN npm install

RUN npm run build

CMD ["/bin/sh", "-c", "./bash.sh"]