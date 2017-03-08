'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('./../CFComposeModel');
const parsers        = require('./../parsers');
const translators    = require('./../translators');
const components     = require('./../components');
const leafs          = components.leafs;
const nodes          = components.nodes;

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);



describe('CFComposeModel', () => {

    describe('Load', () => {

        describe('Compose v1', () => {

            const composeV1FileNames = [{
                name: 'ex1',
                expectedWarnings: [
                    {
                        "actual": "5432:5432 ",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "5432"
                    },
                    {
                        "actual": "postgres:9.4",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    },
                    {
                        "actual": "db",
                        "autoFix": true,
                        "message": "Warning: at service dbpostgres.container_name",
                        "name": "NOT_SUPPORTED",
                        "requireManuallyFix": false,
                        "suggestion": "Remove field"
                    },
                    {
                        "actual": "3000:3000 ",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "3000"
                    },
                    {
                        "actual": "./:/app",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": true,
                        "suggestion": "/app"
                    },
                    {
                        "actual": ".",
                        "autoFix": true,
                        "message": "Warning: at service express-app-container.build",
                        "name": "NOT_SUPPORTED",
                        "requireManuallyFix": false,
                        "suggestion": "Replace with image"
                    },
                    {
                        "actual": "ubuntu",
                        "autoFix": true,
                        "message": "Warning: at service dbstore.image",
                        "name": "LACK_OF_DETAILS_TAG",
                        "requireManuallyFix": false,
                        "suggestion": "latest"
                    },
                    {
                        "actual": "ubuntu",
                        "autoFix": false,
                        "message": "Warning: at service dbstore.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ],
                afterFix: [
                    {
                        "actual": "postgres:9.4",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    },
                    {
                        "actual": "./:/app",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": true,
                        "suggestion": "/app"
                    },
                    {
                        "actual": "express-app-container:latest",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    },
                    {
                        "actual": "ubuntu:latest",
                        "autoFix": false,
                        "message": "Warning: at service dbstore.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ],
                afterAutoFix: [
                    {
                        "actual": "5432:5432 ",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "5432"
                    },
                    {
                        "actual": "postgres:9.4",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    },
                    {
                        "actual": "3000:3000 ",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "3000"
                    },
                    {
                        "actual": "./:/app",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": true,
                        "suggestion": "/app"
                    },
                    {
                        "actual": "express-app-container:latest",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    },
                    {
                        "actual": "ubuntu:latest",
                        "autoFix": false,
                        "message": "Warning: at service dbstore.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ],
                expectedTranslation: `dbpostgres:
  ports:
    - '5432'
  image: 'postgres:9.4'
  volumes_from:
    - dbstore
express-app-container:
  ports:
    - '3000'
  volumes:
    - './:/app'
  links:
    - dbpostgres
  image: 'express-app-container:latest'
dbstore:
  image: 'ubuntu:latest'
`
            }, {
                name: 'ex2',
                expectedWarningsCount: 7,
                afterFixCount: 3,
                avoidTranslation: true,
                afterAutoFixCount: 5
            }
            ];

            composeV1FileNames.map((value) => {
                it(`Detect compose v1 for file name: ${value.name}`, () => {
                    const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                    const compose  = CFComposeModel.load(filePath);
                    expect(compose.parser).to.be.equal(parsers.ComposeV1);
                });

                it(`Should find all warnings for file name ${value.name}`, () => {
                    const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                    const compose  = CFComposeModel.load(filePath);
                    if (value.expectedWarningsCount) {
                        expect(compose.getWarnings().length)
                            .to
                            .be
                            .equal(value.expectedWarningsCount);
                    } else {
                        expect(compose.getWarnings()).to.be.deep.equal(value.expectedWarnings);
                    }
                });

                it(`Should fix all possible warnings and translate for file name ${value.name}`,
                    () => {
                        const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                        const compose  = CFComposeModel.load(filePath);
                        if (value.expectedWarningsCount) {
                            expect(compose.getWarnings().length)
                                .to
                                .be
                                .equal(value.expectedWarningsCount);
                        } else {
                            expect(compose.getWarnings()).to.be.deep.equal(value.expectedWarnings);
                        }
                        compose.fixWarnings();
                        if (value.afterFixCount) {
                            expect(compose.getWarnings().length).to.be.equal(value.afterFixCount);
                        } else {
                            expect(compose.getWarnings()).to.be.deep.equal(value.afterFix);
                        }
                    });

                it(`Should fix all warnings and translate without calling getWarnings for file name ${value.name}`,
                    () => {
                        const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                        const compose  = CFComposeModel.load(filePath);
                        compose.fixWarnings();
                        if (!value.avoidTranslation) {
                            expect(compose.translate()).to.be.deep.equal(value.expectedTranslation);
                        }
                    });

                it(`Should fix only warnings with autoFix for file name ${value.name}`, () => {
                    const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                    const compose  = CFComposeModel.load(filePath);
                    if (value.expectedWarningsCount) {
                        expect(compose.getWarnings().length)
                            .to
                            .be
                            .equal(value.expectedWarningsCount);
                    } else {
                        expect(compose.getWarnings()).to.be.deep.equal(value.expectedWarnings);
                    }
                    compose.fixWarnings(true);
                    if (value.afterAutoFixCount) {
                        expect(compose.getWarnings().length).to.be.equal(value.afterAutoFixCount);
                    } else {
                        expect(compose.getWarnings()).to.be.deep.equal(value.afterAutoFix);
                    }
                });
            });
        });

        describe('Compose v2', () => {

        });
    });

    describe('Upgrade compose v1 to compose v2', () => {
        const composeV2Translator = translators.ComposeV2;
        const composeV1FileNames  = [{
            name: 'ex1',
            newYaml: `version: '2'
services:
  dbpostgres:
    ports:
      - '5432:5432'
    image: 'postgres:9.4'
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
`
        }
        ];

        composeV1FileNames.map((value) => {
            it(`Should upgrade compose v1 ${value.name} to compose v2`, () => {
                const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                const compose  = CFComposeModel.load(filePath);
                expect(compose.translate(composeV2Translator)).to.be.deep.equal(value.newYaml);
            });
        });


    });

    describe('Init from scratch', () => {
        let compose;
        beforeEach(() => {
            compose = new CFComposeModel();
        });

        describe('Work with services', () => {

            it('Should add service', () => {
                const image = leafs.Image.parse('redis', 'image');
                const service = new nodes.Service('my-service', {
                    image: image
                });
                compose.addService(service);
                expect(compose.services['my-service']).to.be.equal(service);
                expect(compose.getWarnings()).to.be.deep.equal([
                    {
                        "actual": "redis",
                        "autoFix": true,
                        "message": "Warning: at service my-service.image",
                        "name": "LACK_OF_DETAILS_TAG",
                        "requireManuallyFix": false,
                        "suggestion": "latest",
                    },
                    {
                        "actual": "redis",
                        "autoFix": false,
                        "message": "Warning: at service my-service.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ]);
            });
        });

        describe('Work with volumes', () => {
            it('', () => {
                // TODO : Add test
                expect(true).to.be.equal(true);
            });
        });

        describe('Work with networks', () => {
            it('', () => {
                // TODO : Add test
                expect(true).to.be.equal(true);
            });
        });

    });

});

