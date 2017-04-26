FROM node:6.9.2

RUN npm install --global yarn

COPY ./package.json /app/

RUN cd /app && yarn install

RUN npm link

COPY . /app/

WORKDIR /app

ENTRYPOINT ['cm', 'test', '-f']
