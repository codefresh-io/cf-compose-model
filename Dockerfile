FROM node:7.9.0

RUN npm install -g git+https://github.com/codefresh-io/cf-compose-model.git#4305b8a19f3892b11d0732d56914913a7e5b33b7

COPY ./package.json /app/

RUN cd /app && yarn install

WORKDIR /app

COPY . .

ENTRYPOINT ["cm"]

