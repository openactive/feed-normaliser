FROM node:13.14.0-alpine
EXPOSE 3000 9229

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/

RUN npm install

COPY . /home/app
