'use strict';

const chai        = require('chai');
const sinonChai   = require('sinon-chai');
const CM          = require('./../../CFComposeModel');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);


describe('Translation to Composev1', () => {

    it('Should translate', () => {
        const cm = CM.load('/Users/oleg/workspace/codefresh/cf-compose-model/lib/model/tests/ComposeV1/ex1.yaml');
        const translated = cm.translate();
        const expected = `dbpostgres:
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

        expect(translated).to.be.deep.equal(expected);
    });

});



