'use strict';

const path           = require('path');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');

const expect = chai.expect;
chai.use(sinonChai);

function getPath(name) {
    return path.resolve(__dirname, `./yamls/ComposeV1/${name}.yaml`);
}
describe('Compose v1 testing', () => {
    it('Should parse yaml', () => {

        const string = `cfrouter:
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

        return CFComposeModel.parse(string)
            .then(compose => {
                expect(compose.getAllServices()).to.be.deep.equal({
                    "cfrouter": {
                        "_name": "cfrouter",
                        "environment": {
                            "NODE_ENV": "development-docker"
                        },
                        "image": {
                            "_name": "image",
                            "_owner": "codefresh",
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
                        "ports": [
                            {
                                "_name": "ports",
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

    describe('Should throw errors', () => {

        it('Should throw an error when image passed not as string', () => {
            const location = getPath('ex1.image');
                return CFComposeModel.load(location)
                    .catch(err => {
                        expect(err.message).to.be.deep.equal('Image must be string');
                    });
        });

        it('Should throw an error when ports passing not as object or array', () => {
            const location = getPath('ex2.ports');
            return CFComposeModel.load(location)
                .catch(err => {
                expect(err.message).to.be.deep.equal('Ports must be array or object');
            });
        });

        it('Should throw an error when volumes passing not as object or array', () => {
            const location = getPath('ex3.volumes');
            return CFComposeModel.load(location)
                .catch(err => {
                expect(err.message).to.be.deep.equal('Volumes must be array or object');
            });
        });

        it('Should throw an error when unsupported fields by compose passing', () => {
            const location = getPath('ex4.unsupported');
            return CFComposeModel.load(location)
                .catch(err => {
                expect(err.message)
                    .to
                    .be
                    .deep
                    .equal(`Field 'not_compose_field' is not supported by compose v1`);
            });
        });
    });
});