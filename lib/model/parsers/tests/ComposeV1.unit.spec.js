'use strict';

const path                              = require('path');
const chai                              = require('chai');
const sinonChai                         = require('sinon-chai');
const CFComposeModel                    = require('../../CFComposeModel');
const parser                            = require('./../ComposeV1');

const expect = chai.expect;
chai.use(sinonChai);

function getPath(name) {
    return path.resolve(__dirname, `./yamls/ComposeV1/${name}.yaml`);
}
describe('Compose v1 testing', () => {
    it('Should parse yaml', () => {

        const yamlObj = {
            cfrouter: {
                image: 'codefresh/cf-router:develop',
                labels: [
                    "io.codefresh.owner=codefresh",
                    "io.codefresh.owner=codefresh111"
                ],
                ports: [
                    '80:80'
                ],
                environment: {
                    NODE_ENV: 'development-docker'
                },
                links: [
                    'cfui:cf-ui',
                    'cfapi:cf-api'
                ]
            }
        };

        return CFComposeModel.parse(yamlObj)
            .then(compose => {
                expect(compose.getAllServices()).to.be.deep.equal({
                    "cfrouter": {
                        "_metadata": {},
                        "_name": "cfrouter",
                        "_order": [
                            "image",
                            "labels",
                            "ports",
                            "environment",
                            "links"
                        ],
                        "_portsType": "Array",
                        "environment": {
                            "NODE_ENV": "development-docker"
                        },
                        "image": {
                            "_metadata": {},
                            "_name": "image",
                            "_order": [],
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
                                "_metadata": {},
                                "_name": "ports",
                                "_order": [],
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
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": [
                            "docker",
                            "ubuntu"
                        ],
                        "fieldName": "image",
                        "message": "Image must be string, got Array",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should throw an error when ports passing not as object or array', () => {
            const location = getPath('ex2.ports');
            return CFComposeModel.load(location)
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": 8080,
                        "fieldName": "ports",
                        "message": "Ports must be array or object, got number",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should throw an error when volumes passing not as object or array', () => {
            const location = getPath('ex3.volumes');
            return CFComposeModel.load(location)
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": "blabla",
                        "fieldName": "volumes",
                        "message": "Volumes must be array or object, got string",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should throw an error when unsupported fields by compose passing', () => {
            const location = getPath('ex4.unsupported');
            return CFComposeModel.load(location)
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "data": "some value",
                        "message": "Field 'not_compose_field' is not supported by compose v1",
                        "name": "FIELD_NOT_SUPPORTED"
                    });
                });
        });

        it('Should throw an errors and warnings together', () => {
            const yamlJson = {
                os: {
                    image: 'image is ok',
                    ports: '8080',
                    volumes: [
                        "./app:/app"
                    ]
                }
            };

            return parser.parse(yamlJson)
                .then(() => {
                    expect(true).to.be.equal(false);
                })
                .catch(err => {
                    expect(err).to.have.keys(['errors', 'warnings', 'originalYaml', '_name', '_message']);
                    expect(err.errors).to.be.deep.equal([
                        {
                            "_data": "8080",
                            "_fieldName": "ports",
                            "_message": "Ports must be array or object, got string",
                            "_name": "INVALID_SYNTAX_ON_FIELD"
                        }
                    ]);
                    expect(err.warnings).to.be.deep.equal([{
                            "_actual": "./app\n/app",
                            "_fieldName": "./app",
                            "_fieldValue": "/app",
                            "_message": "Warning: at service os.volumes",
                            "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                            "_requireManuallyFix": true,
                            "_suggestion": "Volume mapping is not supported, try use: /app",
                            "displayName": "volumes",
                            "readable": "Warning: at service os.volumes. The value ./app\n/app is not allowed. Volume mapping is not supported, try use: /app"
                        }
                    ]);
                });
        });
    });

});