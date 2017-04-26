FROM node:7.9.0

RUN npm install -g git+https://github.com/codefresh-io/cf-compose-model.git#3343987a2f3e7eedf4b71c650f5da372202d6321

COPY ./package.json /app/

RUN cd /app && yarn install

WORKDIR /app

COPY . .

ENTRYPOINT ["cm"]

