'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const CM        = require('./../../CFComposeModel');
const path      = require('path');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);


describe('Translation to Composev1', () => {

    it('Should translate', () => {
        const expected   = `dbpostgres:
  image: 'postgres:9.4'
  ports:
    - '5432:5432'
  container_name: db
  volumes_from:
    - dbstore
express-app-container:
  ports:
    - '3000:3000'
  volumes:
    - './:/app'
  build: .
  links:
    - dbpostgres
dbstore:
  image: ubuntu
`;
        const location = path.resolve(__dirname, './../../tests/ComposeV1/ex1.yaml');
        return CM.load(location)
            .then(compose => {
                return  compose.translate();
            })
            .then(translated => {
                expect(translated).to.be.deep.equal(expected);
            });


    });

});



