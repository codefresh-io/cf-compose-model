'use strict';

const chai                = require('chai');
const sinonChai           = require('sinon-chai');
const CFComposeModel      = require('../../CFComposeModel');
const YAML                = require('yamljs');

const expect = chai.expect;
chai.use(sinonChai);


describe('Compose v1 testing', () => {
    it('', () => {

        const string     = `cfrouter:
  image: codefresh/cf-router:develop
  labels:
    - "io.codefresh.owner=codefresh"
    - "io.codefresh.owner=codefresh111"
  ports:
    - "80:80"
  environment:
    NODE_ENV: development-docker
  links:
    - cfui:cf-ui
    - cfapi:cf-api`;

        const expectedString = {
            "cfrouter": {
                "environment": [
                    "NODE_ENV=development-docker"
                ],
                "image": "codefresh/cf-router:develop",
                "labels": [
                    "io.codefresh.owner=codefresh",
                    "io.codefresh.owner=codefresh111"
                ],
                "links": [
                    "cfui:cf-ui",
                    "cfapi:cf-api"
                ],
                "ports": [
                    "80:80"
                ]
            }
        };

        const compose    = CFComposeModel.parse(string);
        const translated = YAML.parse(compose.translate());

        expect(translated).to.be.deep.equal(expectedString);

    });
});