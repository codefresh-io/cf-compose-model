'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('./../CFComposeModel');
const parsers        = require('./../parsers');
const translators    = require('./../translators');
const components     = require('./../components');
const Image          = components.Image;
const Service        = components.Service;
const expect         = chai.expect; // jshint ignore:line
const path           = require('path');

chai.use(sinonChai);



describe('CFComposeModel', () => {

    describe('Model testing', () => {
        let cm;
        beforeEach(() => {
            cm = new CFComposeModel();
        });

        it('Should return all service', () => {
            expect(cm.getAllServices()).to.be.deep.equal({});
        });

        it('Should return all volumes', () => {
            expect(cm.getAllVolumes()).to.be.deep.equal({});
        });

        it('Should return all networks', () => {
            expect(cm.getAllNetworks()).to.be.deep.equal({});
        });
    });

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
  image: 'postgres:9.4'
  ports:
    - '5432'
  volumes_from:
    - dbstore
express-app-container:
  image: 'express-app-container:latest'
  ports:
    - '3000'
  volumes:
    - './:/app'
  links:
    - dbpostgres
dbstore:
  image: 'ubuntu:latest'
`
        }, {
            name: 'ex2',
            expectedWarningsCount: 7,
            afterFixCount: 3,
            avoidTranslation: true,
            afterAutoFixCount: 5
        }, {
            name: 'ex3',
            expectedWarningsCount: 13,
            afterFixCount: 5,
            avoidTranslation: true,
            afterAutoFixCount: 9
        }
        ];
        composeV1FileNames.map((value) => {
            it(`Detect compose v1 for file name: ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                const compose  = CFComposeModel.load(filePath);
                expect(compose.parser).to.be.equal(parsers.ComposeV1);
            });

            it(`Should find all warnings for file name ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
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
                    const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
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
                    const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                    const compose  = CFComposeModel.load(filePath);
                    compose.fixWarnings();
                    if (!value.avoidTranslation) {
                        expect(compose.translate()).to.be.deep.equal(value.expectedTranslation);
                    }
                });

            it(`Should fix only warnings with autoFix for file name ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
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
        it('Should find all warnings and fix possible', () => {
            const filePath                     = `${__dirname}/ComposeV2/ex2.yaml`;
            const compose                      = CFComposeModel.load(filePath);
            const expectedWarningArray         = [
                {
                    "actual": "myapp",
                    "autoFix": true,
                    "message": "Warning: at service web.image",
                    "name": "LACK_OF_DETAILS_TAG",
                    "requireManuallyFix": false,
                    "suggestion": "latest"
                },
                {
                    "actual": "myapp",
                    "autoFix": false,
                    "message": "Warning: at service web.image",
                    "name": "LACK_OF_DETAILS_OWNER_NAME",
                    "requireManuallyFix": true,
                    "suggestion": ""
                },
                {
                    "actual": "redis-data:/var/lib/redis",
                    "autoFix": false,
                    "message": "Warning: at service redis.volumes",
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": true,
                    "suggestion": "/var/lib/redis"
                },
                {
                    "actual": "redis",
                    "autoFix": true,
                    "message": "Warning: at service redis.image",
                    "name": "LACK_OF_DETAILS_TAG",
                    "requireManuallyFix": false,
                    "suggestion": "latest",
                },
                {
                    "actual": "redis",
                    "autoFix": false,
                    "message": "Warning: at service redis.image",
                    "name": "LACK_OF_DETAILS_OWNER_NAME",
                    "requireManuallyFix": true,
                    "suggestion": ""
                },
                {
                    "actual": "{\"redis-data\":{\"_name\":\"redis-data\",\"warnings\":[],\"driver\":\"flocker\"}}",
                    "autoFix": false,
                    "message": "Warning at: volumes",
                    "name": "NOT_SUPPORTED",
                    "requireManuallyFix": true,
                    "suggestion": "Remove field"
                }
            ];
            const expectedWarrnigArrayAfterFix = [
                {
                    "actual": "myapp:latest",
                    "autoFix": false,
                    "message": "Warning: at service web.image",
                    "name": "LACK_OF_DETAILS_OWNER_NAME",
                    "requireManuallyFix": true,
                    "suggestion": ""
                },
                {
                    "actual": "redis-data:/var/lib/redis",
                    "autoFix": false,
                    "message": "Warning: at service redis.volumes",
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": true,
                    "suggestion": "/var/lib/redis"
                },
                {
                    "actual": "redis:latest",
                    "autoFix": false,
                    "message": "Warning: at service redis.image",
                    "name": "LACK_OF_DETAILS_OWNER_NAME",
                    "requireManuallyFix": true,
                    "suggestion": ""
                },
                {
                    "actual": "{\"redis-data\":{\"_name\":\"redis-data\",\"warnings\":[],\"driver\":\"flocker\"}}",
                    "autoFix": false,
                    "message": "Warning at: volumes",
                    "name": "NOT_SUPPORTED",
                    "requireManuallyFix": true,
                    "suggestion": "Remove field"
                }
            ];
            expect(compose.getWarnings()).to.be.deep.equal(expectedWarningArray);
            compose.fixWarnings();
            expect(compose.getWarnings()).to.be.deep.equal(expectedWarrnigArrayAfterFix);
        });

        it('Should parse and translate compose v2', () => {
            const filePath     = `${__dirname}/ComposeV2/ex2.yaml`;
            const compose      = CFComposeModel.load(filePath);
            const expectedYaml = `version: '2'
services:
  web:
    image: myapp
    networks:
      - front
      - back
  redis:
    image: redis
    volumes:
      - 'redis-data:/var/lib/redis'
    networks:
      - back
volumes:
  redis-data:
    driver: flocker
networks:
  front:
    driver: overlay
  back:
    driver: overlay
`;
            const translated   = compose.translate();
            expect(translated).to.be.equal(expectedYaml);
        });
    });

    describe('Upgrade compose v1 to compose v2', () => {
        const composeV2Translator = translators.ComposeV2;
        const composeV1FileNames  = [{
            name: 'ex1',
            newYaml: `version: '2'
services:
  dbpostgres:
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
`
        }
        ];

        composeV1FileNames.map((value) => {
            it(`Should upgrade compose v1 ${value.name} to compose v2`, () => {
                const filePath = `${__dirname}/ComposeV1/${value.name}.yaml`;
                const compose  = CFComposeModel.load(filePath);
                console.log(compose.translate(composeV2Translator));
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
                const image   = Image.parse('redis', 'image');
                const service = new Service('my-service', {
                    image: image
                });
                compose.addService(service);
                expect(compose.getAllServices()['my-service']).to.be.equal(service);
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

    describe.skip('Policies', () => {
        it('Should init policies', () => {
            const cm = new CFComposeModel();
            expect(cm.services.policies).to.be.deep.equal({
                "build": {
                    "supported": false
                },
                "container_name": {
                    "supported": false
                },
                "ports": {
                    "allowPortMapping": false
                },
                "volumes": {
                    "allowVolumeMapping": false
                }
            });
        });
    });
});


