'use strict';

const chai                = require('chai');
const sinonChai           = require('sinon-chai');
const CFComposeModel      = require('../../CFComposeModel');

const expect = chai.expect;
chai.use(sinonChai);


describe('Compose v1 testing', () => {
    it('Should parse yaml', () => {

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

        const compose    = CFComposeModel.parse(string);
        expect(compose.getAllServices()).to.be.deep.equal({
            "cfrouter": {
                "environment": {
                    "NODE_ENV": "development-docker"
                },
                "image": {
                    "_owner": "codefresh",
                    "_parentFieldName": "image",
                    "_repoName": "cf-router",
                    "_tag": "develop",
                    "warnings": []
                },
                "labels": [
                    "io.codefresh.owner=codefresh",
                    "io.codefresh.owner=codefresh111"
                ],
                "links": [
                    "cfui:cf-ui",
                    "cfapi:cf-api"
                ],
                "name": "cfrouter",
                "ports": [
                    {
                        "_parentFieldName": "ports",
                        "_protocol": undefined,
                        "_source": "80",
                        "_target": "80",
                        "warnings": []
                    }
                ],
                "warnings": []
            }
        });

    });
});