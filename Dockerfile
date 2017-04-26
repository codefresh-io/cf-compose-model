FROM node:6.9.2

RUN npm install --global yarn

COPY ./package.json /app/

RUN cd /app && yarn install

WORKDIR /app

RUN npm link

COPY . .

ENTRYPOINT ['cm', 'test', '-f']
