FROM node:16.14-alpine

#RUN npm install --global yarn

COPY ./package.json /app/

RUN cd /app && yarn install

COPY . /app/

WORKDIR /app

CMD [ "yarn", "start" ]

EXPOSE 3000