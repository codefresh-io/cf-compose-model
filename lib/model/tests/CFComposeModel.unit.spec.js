'use strict';

const YAML           = require('js-yaml');
const fs             = require('fs');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('./../CFComposeModel');
const parsers        = require('./../parsers');
const translators    = require('./../translators');
const components     = require('./../components');
const Service        = components.Service;
const Network        = components.Network;
const Volume         = components.Volume;
const ServiceVolume  = components.ServiceVolume;
const expect         = chai.expect; // jshint ignore:line
const path           = require('path');
const policies       = require('./../policies');
const proPolicy      = policies.pro;
const _              = require('lodash');

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

        it('Should get service by name', () => {
            const service = new Service('web').setImage('ubuntu').addPort('80');
            cm.addService(service);
            const service2 = cm.getServiceByName('web');
            expect(service).to.be.deep.equal(service2);
        });

        it('Should return the order of services', () => {
            const cm = new CFComposeModel();
            const s1 = new Service('s1');
            const s2 = new Service('s2');
            const s3 = new Service('s3');
            cm.addService(s1);
            cm.addService(s2);
            cm.addService(s3);
            expect(cm.getServicesOrder()).to.be.deep.equal([
                "s1",
                "s2",
                "s3"
            ]);
        });

        it('Should format and stringify warnings', () => {
            const service = new Service('os').addPort('80:80').addVolume('/app:/app');
            const cm      = new CFComposeModel();
            cm.addService(service);
            return cm.getWarnings()
                .then(CFComposeModel.stringifyWarnings)
                .then((formatted) => {
                    expect(formatted).to.be.deep.equal([
                        "{\"actual\":\"ports\\n80:80\",\"suggestion\":\"Port mapping not supported, try use 80\",\"name\":\"FIELD_NOT_SUPPORTED_IN_POLICY\",\"message\":\"Warning: at service os.ports\",\"autoFix\":false,\"requireManuallyFix\":false,\"displayName\":\"ports\"}\n",
                        "{\"actual\":\"/app\\n/app\",\"suggestion\":\"Volume mapping is not supported, try use: /app\",\"name\":\"FIELD_NOT_SUPPORTED_IN_POLICY\",\"message\":\"Warning: at service os.volumes\",\"autoFix\":false,\"requireManuallyFix\":true,\"displayName\":\"volumes\"}\n"
                    ]);
                });
        });

        it('Should format and stringify errors', () => {
            const yamlObj = {
                version: '2',
                services: {
                    os: {
                        iamge: 'non-image'
                    }
                },
                volumess: []
            };

            return CFComposeModel.parse(yamlObj)
                .catch(err => {
                    return CFComposeModel.stringifyErrors(err.getErrors());
                })
                .then(formatted => {
                    expect(formatted).to.be.deep.equal([
                        "{\"data\":\"non-image\",\"name\":\"FIELD_NOT_SUPPORTED\",\"message\":\"Field 'iamge' is not supported by compose\"}\n",
                        "{\"fieldName\":\"volumess\",\"fieldData\":[],\"message\":\"volumess is not supported by compose v2\",\"requireManuallyFix\":true}\n"
                    ]);
                });
        });

    });

    describe('Compose v1', () => {

        const composeV1FileNames = [
            {
                name: 'ex1',
                expectedWarnings: [
                    {
                        "actual": "build\n.",
                        "autoFix": false,
                        "displayName": "build",
                        "message": "Warning: at service express-app-container.build.",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Replace build property with image"
                    },
                    {
                        "actual": "ports\n3000:3000",
                        "autoFix": false,
                        "displayName": "ports",
                        "message": "Warning: at service express-app-container.ports",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Port mapping not supported, try use 3000"
                    },
                    {
                        "actual": "/\n/app",
                        "autoFix": false,
                        "displayName": "volumes",
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Volume mapping is not supported, try use: /app"
                    },
                    {
                        "actual": "container_name\ndb",
                        "autoFix": true,
                        "displayName": "container_name",
                        "message": "Warning: at service dbpostgres.container_name.",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Field not supported , avoid using \"container_name\""
                    },
                    {
                        "actual": "ports\n5432:5432",
                        "autoFix": false,
                        "displayName": "ports",
                        "message": "Warning: at service dbpostgres.ports",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Port mapping not supported, try use 5432",
                    },
                ],
                afterFix: [
                    {
                        "actual": "/\n/app",
                        "autoFix": false,
                        "message": "",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Volume mapping is not allowed, try use: /app",
                    }
                ],
                afterAutoFix: [
                    {
                        "actual": "build\n.",
                        "autoFix": false,
                        "displayName": "build",
                        "message": "Warning: at service express-app-container.build.",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Replace build property with image"
                    },
                    {
                        "actual": "ports\n3000:3000",
                        "autoFix": false,
                        "displayName": "ports",
                        "message": "Warning: at service express-app-container.ports",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Port mapping not supported, try use 3000",
                    },
                    {
                        "actual": "/\n/app",
                        "autoFix": false,
                        "displayName": "volumes",
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Volume mapping is not supported, try use: /app",
                    },
                    {
                        "actual": "ports\n5432:5432",
                        "autoFix": false,
                        "displayName": "ports",
                        "message": "Warning: at service dbpostgres.ports",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Port mapping not supported, try use 5432"
                    },
                ],
                expectedTranslation: `dbpostgres:
  image: 'owner/postgres:9.4'
  volumes_from:
    - dbstore
  ports:
    - '5432'
express-app-container:
  ports:
    - '3000'
  volumes:
    - '/:/app'
  links:
    - dbpostgres
  image: 'express-app-container:latest'
dbstore:
  image: ubuntu
`
            },
            {
                name: 'ex2',
                expectedWarningsCount: 5,
                afterFixCount: 3,
                avoidTranslation: true,
                afterAutoFixCount: 5
            },
            {
                name: 'ex3',
                expectedWarningsCount: 10,
                afterFixCount: 5,
                avoidTranslation: true,
                afterAutoFixCount: 10
            }
        ];
        composeV1FileNames.map((value) => {
            it(`Detect compose v1 for file name: ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        expect(compose.parser).to.be.equal(parsers.ComposeV1.Parser);
                    });
            });

            it(`Should find all warnings for file name ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        if (value.expectedWarningsCount) {
                            return compose.getWarnings()
                                .then((warnings) => {
                                    expect(warnings.length)
                                        .to
                                        .be
                                        .equal(value.expectedWarningsCount);
                                });

                        } else {
                            return compose.getWarnings()
                                .then(warnings => {
                                    const formattedWarnings = warnings.map(
                                        warning => warning.format());
                                    expect(formattedWarnings)
                                        .to
                                        .be
                                        .deep
                                        .equal(value.expectedWarnings);
                                });
                        }
                    });

            });

            it(`Should fix all possible warnings and translate for file name ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        if (value.expectedWarningsCount) {
                            return compose.getWarnings()
                                .then((warnings) => {
                                    expect(warnings.length)
                                        .to
                                        .be
                                        .equal(value.expectedWarningsCount);
                                });
                        } else {
                            return compose.getWarnings()
                                .then(warnings => {
                                    _.forEach(warnings, (warning, index)=> {
                                        expect(warning.format())
                                            .to
                                            .be
                                            .deep
                                            .equal(value.expectedWarnings[index]);
                                    });
                                });
                        }
                        compose.fixWarnings();
                        if (value.afterFixCount) {
                            expect(compose.getWarnings().length).to.be.equal(value.afterFixCount);
                        } else {
                            expect(compose.getWarnings()).to.be.deep.equal(value.afterFix);
                        }
                    });
            });

            it(`Should fix all warnings and translate without calling getWarnings for file name ${value.name}`,
                () => {
                    const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                    return CFComposeModel.load(filePath)
                        .then(compose => {
                            return compose.fixWarnings()
                                .then(() => {
                                    return compose;
                                });
                        })
                        .then((compose) => {
                            if (!value.avoidTranslation) {
                                return compose.translate().toYaml();
                            }
                            return;
                        })
                        .then(translated => {
                            expect(translated).to.be.deep.equal(value.expectedTranslation);
                        });
                });

            it(`Should fix only warnings with autoFix for file name ${value.name}`, () => {
                const filePath = path.resolve(__dirname, `./ComposeV1/${value.name}.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        if (value.expectedWarningsCount) {
                            return compose.getWarnings()
                                .then((warnings) => {
                                    expect(warnings.length)
                                        .to
                                        .be
                                        .equal(value.expectedWarningsCount);
                                    return compose;
                                });
                        } else {
                            return compose.getWarnings()
                                .then(warnings => {
                                    _.forEach(warnings, (warning, index) => {
                                        expect(warning.format())
                                            .to
                                            .be
                                            .deep
                                            .equal(value.expectedWarnings[index]);
                                    });
                                    return compose;
                                });
                        }
                    })
                    .then(compose => {
                        return compose.fixWarnings(true)
                            .then(() => {
                                if (value.afterAutoFixCount) {
                                    return compose.getWarnings()
                                        .then((warnings) => {
                                            expect(warnings.length)
                                                .to
                                                .be
                                                .equal(value.afterAutoFixCount);
                                        });
                                } else {
                                    return compose.getWarnings()
                                        .then((warnings) => {
                                            _.forEach(warnings, (warning, index) => {
                                                expect(warning.format())
                                                    .to
                                                    .be
                                                    .deep
                                                    .equal(value.afterAutoFix[index]);
                                            });
                                        });
                                }
                            });
                    });
            });
        });

        it('Should validate basic flow on pro policy', () => {
            const filePath = path.resolve(__dirname, `./ComposeV1/ex1.yaml`);
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.setPolicy(proPolicy);
                    const expectedWarningArray = [
                        {
                            "actual": "container_name\ndb",
                            "autoFix": true,
                            "displayName": "container_name",
                            "message": "Warning: at service dbpostgres.container_name.",
                            "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                            "requireManuallyFix": false,
                            "suggestion": "Field not supported , avoid using \"container_name\""
                        },
                        {
                            "actual": "build\n.",
                            "autoFix": false,
                            "displayName": "build",
                            "message": "Warning: at service express-app-container.build.",
                            "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                            "requireManuallyFix": true,
                            "suggestion": "Replace build property with image"
                        }
                    ];
                    return compose.getWarnings()
                        .then(warnings => {
                            _.forEach(warnings, (warning, index) => {
                                expect(warning.format())
                                    .to
                                    .be
                                    .deep
                                    .equal(expectedWarningArray[index]);
                            });
                        });
                });
        });

        it('Should parse single service', (done) => {
            const filePath = path.resolve(__dirname, `./ComposeV1/ex1.yaml`);
            return CFComposeModel.load(filePath)
                .then(composeModel => {
                    composeModel.parseService('os', {
                        image: 'ubuntu'
                    })
                        .then(service => {
                            expect(service.getName()).to.be.equal('os');
                        })
                        .done(done, done);
                });

        });

    });

    describe('Compose v2', () => {

        it('Should find all warnings and fix possible', () => {
            const filePath                     = `${__dirname}/ComposeV2/ex2.yaml`;
            const expectedWarningArray         = [
                {
                    "actual": "redis-data\n[object Object]",
                    "autoFix": false,
                    "displayName": "volumes",
                    "message": "Warning at: volumes.redis-data",
                    "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                    "requireManuallyFix": true,
                    "suggestion": "driver: local",
                }
            ];
            const expectedWarrnigArrayAfterFix = [
                {
                    "actual": "redis-data\n[object Object]",
                    "autoFix": false,
                    "displayName": "volumes",
                    "message": "Warning at: volumes.redis-data",
                    "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                    "requireManuallyFix": true,
                    "suggestion": "driver: local"
                }
            ];
            return CFComposeModel.load(filePath)
                .then((compose) => {
                    return compose.getWarnings()
                        .then(warnings => {
                            _.forEach(warnings, (warning, index) => {
                                expect(warning.format())
                                    .to
                                    .be
                                    .deep
                                    .equal(expectedWarningArray[index]);
                            });
                            return compose;
                        })
                        .then(compose.fixWarnings.bind(compose))
                        .then(() => {
                            return compose.getWarnings();
                        })
                        .then(warnings => {
                            _.forEach(warnings, (warning, index) => {
                                expect(warning.format())
                                    .to
                                    .be
                                    .deep
                                    .equal(expectedWarrnigArrayAfterFix[index]);
                            });
                        });
                });
        });

        it('Should parse and translate compose v2', () => {
            const filePath     = `${__dirname}/ComposeV2/ex2.yaml`;
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
  mongo-data:
    driver: local
networks:
  front:
    driver: overlay
  back:
    driver: overlay
`;
            return CFComposeModel.load(filePath).then(compose => {
                return compose.translate().toYaml();
            })
                .then(translated => {
                    expect(translated).to.be.equal(expectedYaml);
                });
        });

        it('Should keep the order of all yaml when just translating the ymal', () => {
            const location     = path.resolve(__dirname, './ComposeV2/ex2.yaml');
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
  mongo-data:
    driver: local
networks:
  front:
    driver: overlay
  back:
    driver: overlay
`;

            return CFComposeModel.load(location)
                .then(compose => {
                    return compose.translate().toYaml();
                })
                .then(translated => {
                    expect(translated).to.be.deep.equal(expectedYaml);
                });
        });

        it('Should allow volumes from CF_VOLUME', () => {
            const filePath = `${__dirname}/ComposeV2/ex7.yaml`;
            return CFComposeModel.load(filePath)
                .then(compose => {
                    return compose.getWarnings();
                })
                .then(warnings => {
                    expect(warnings).to.be.deep.equal([]);
                });
        });

        it('Should add more sources to allowed volume sources', () => {
            const filePath = `${__dirname}/ComposeV2/ex7.yaml`;
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.setupPredefinedVolumes(['/special-path-only', '${{CF_VOLUME}}']);
                    const volume  = new ServiceVolume('custom')
                        .setSource('/special-path-only')
                        .setTarget('/app');
                    const service = compose.getServiceByName('web');
                    service.addVolume(volume);
                    return compose.getWarnings();
                })
                .then(warnings => {
                    expect(warnings).to.be.deep.equal([]);
                });
        });

        it('Should get errors in parsing', () => {
            const filePath = `${__dirname}/ComposeV2/ex8.yaml`;
            return CFComposeModel.load(filePath)
                .catch(err => {
                    expect(err.getErrors()[0].format()).to.be.deep.equal({
                        "fieldData": "value",
                        "fieldName": "data",
                        "message": "Volume must be object, got string",
                        "requireManuallyFix": true
                    });
                });
        });

        it.skip('Should fix warnings when errors exist', () => {
            const yaml = {
                version: '2',
                services: {
                    web: {
                        image: 'redis',
                        ports: ['8080:8080'],
                        ports1: 'not-supported'
                    }
                },
                volumes: {
                    redis: {
                        driver: 'somedriver'
                    }
                }
            };
            let cm;
            return CFComposeModel.parse(yaml)
                .then(compose => {
                    cm = compose;
                    return compose.getErrorsAndWarnings();
                })
                .then(() => {
                    return cm.translate().toYaml();
                })
                .then(translated => {// jshint ignore:line
                });
        });

        it('Should add explicitly add a definition of a driver in case a volume exists without a driver',
            () => {
                const filePath = path.resolve(__dirname, `./ComposeV2/ex10.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        return compose.translate().toJson();
                    })
                    .then((translated) => {
                        expect(translated.volumes['vol'].driver).to.equal('local');
                    });
            });

        it('Should add explicitly add a definition of a driver in case a network exists without a driver',
            () => {
                const filePath = path.resolve(__dirname, `./ComposeV2/ex10.yaml`);
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        return compose.translate().toJson();
                    })
                    .then((translated) => {
                        expect(translated.networks['net'].driver).to.equal('bridge');
                    });
            });

    });

    describe('Compose v3', () => {
        it('Should validate basic flow', () => {
            const filePath = `${__dirname}/ComposeV3/ex1.yaml`;
            return CFComposeModel.load(filePath)
                .then(compose => {
                    return compose.translate().toJson();
                })
                .then(translated => {
                    const expected = YAML.safeLoad(fs.readFileSync(filePath, 'utf8'));
                    expect(expected.services).to.be.deep.equal(translated.services);
                    expect(_.keys(expected.networks)).to.be.deep.equal(_.keys(translated.networks));
                    expect(_.keys(expected.volumes)).to.be.deep.equal(_.keys(translated.volumes));
                });
        });
    });

    describe('Upgrade compose v1 to compose v2', () => {
        const composeV2Translator = translators.ComposeV2;
        const composeV1FileNames  = [{
            name: 'ex1',
            newYaml: `version: '2'
services:
  dbpostgres:
    image: 'owner/postgres:9.4'
    container_name: db
    volumes_from:
      - dbstore
    ports:
      - '5432:5432'
  express-app-container:
    build: .
    ports:
      '3000': '3000'
    volumes:
      - '/:/app'
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
                return CFComposeModel.load(filePath)
                    .then(compose => {
                        return compose.translate(composeV2Translator).toYaml();
                    })
                    .then(translated => {
                        expect(translated).to.be.deep.equal(value.newYaml);
                    });
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
                const service = new Service('my-service').setImage('redis');
                compose.addService(service);
                expect(compose.getAllServices()['my-service']).to.be.equal(service);
                return compose.getWarnings()
                    .then(warnings => {
                        expect(warnings).to.be.deep.equal([]);
                    });
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

    describe('Policies', () => {

    });

    describe('getParserForYaml', () => {


        const versions = [
            {
                title: 'Should detect that yaml with no version is v1',
                jsonYaml: {
                    web: {
                        image: 'ububnt'
                    }
                },
                expectedParser: parsers.ComposeV1
            },
            {
                title: `Should detect version 2 of compose`,
                jsonYaml: {
                    version: '2'
                },
                expectedParser: parsers.ComposeV2
            },
            {
                title: `Should detect version 2.0 of compose`,
                jsonYaml: {
                    version: '2.0'
                },
                expectedParser: parsers.ComposeV2
            },
            {
                title: `Should detect version 3 of compose`,
                jsonYaml: {
                    version: '3'
                },
                expectedParser: parsers.ComposeV3
            },
            {
                title: `Should detect version 3.0 of compose`,
                jsonYaml: {
                    version: '3.0'
                },
                expectedParser: parsers.ComposeV3
            }
        ];


        versions.map(version => {
            it(`${version.title}`, () => {
                const Parser = CFComposeModel.getParserForYaml(version.jsonYaml);
                expect(Parser).to.be.equal(version.expectedParser.Parser);
            });
        });

        it('Should return an error if the yaml cannot be parsed', () => {
            const filePath = path.resolve(__dirname, `./ComposeV1/error.yaml`);
            return CFComposeModel.load(filePath)
                .then(() => {
                    expect(true).to.be.equal(false);
                })
                .catch((err) => {
                    expect(err.getErrors()[0].format())
                        .to
                        .be
                        .deep
                        .equal({
                            "name": "YAML_PARSING_FAILED",
                            "message": "end of the stream or a document separator is expected at line 2, column 8:\n      image: ubuntu\n           ^",
                            "original": "app\n  image: ubuntu"
                        });

                    expect(err.toString()).to.be.equal(`Error: YAML_PARSING_FAILED
With message: end of the stream or a document separator is expected at line 2, column 8:
      image: ubuntu
           ^
Based on input:

|-
  app
    image: ubuntu
`);
                });
        });

        it('Should throw an error if yaml not supplied', () => {
            try {
                CFComposeModel.getParserForYaml();
            } catch (err) {
                expect(err).to.be.an.instanceof(require('./../cm-errors').YamlNotSuppliedError);
            }
        });
    });

    describe('getParsersForYaml', () => {
        it('Should get all parsers for yaml-js obj for compose v1 yaml', () => {
            const yaml = {
                web: {
                    image: 'redis'
                }
            };

            const parsers = CFComposeModel.getParsersForYaml(yaml);
            expect(parsers).to.have.all.keys(['Parser', 'ServiceParser']);

        });

        it('Should get all parsers for yaml-js obj for compose v2 yaml', () => {
            const yaml = {
                version: '2'
            };

            const parsers = CFComposeModel.getParsersForYaml(yaml);
            expect(parsers)
                .to
                .have
                .all
                .keys(['Parser', 'ServiceParser', 'NetworkParser', 'VolumeParser']);

        });

        it('Should throw an error when parsers not found', () => {
            try {
                CFComposeModel.getParsersForYaml({ version: '4' });
            } catch (err) {
                expect(err.getErrors()[0].format()).to.be.deep.equal({
                    "message": "Yaml version not supported yet",
                    "name": "YAML_PARSING_FAILED",
                    "original": {
                        "version": "4"
                    }
                });
            }
        });

    });

    describe('Working with the model', () => {
        const tests = [{
            title: 'Should map over all services',
            file: './ComposeV2/ex2.yaml',
            functionToInvoke: 'mapOverServices',
            cb: (key, val) => {
                expect(val).to.be.instanceof(Service);
            }
        }, {
            title: 'Should map over all networks',
            file: './ComposeV2/ex2.yaml',
            functionToInvoke: 'mapOverNetworks',
            cb: (key, val) => {
                expect(val).to.be.instanceof(Network);
            }
        }, {
            title: 'Should map over all volumes',
            file: './ComposeV2/ex2.yaml',
            functionToInvoke: 'mapOverVolumes',
            cb: (key, val) => {
                expect(val).to.be.instanceof(Volume);
            }
        }
        ];

        tests.map(test => {
            it(test.title, () => {
                const filePath = path.resolve(__dirname, test.file);
                CFComposeModel.load(filePath)
                    .then(compose => {
                        return compose[test.functionToInvoke](test.cb);
                    });
            });
        });


        it('Should replace service and keep the name', () => {
            const yamlLocation = './ComposeV2/ex2.yaml';
            const filePath     = path.resolve(__dirname, yamlLocation);
            const newService   = new Service('web');
            newService.setImage('redis');
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.replaceServiceWith(newService);
                    expect(compose.getServiceByName('web')).to.be.equal(newService);
                    expect(Object.keys(compose.getAllServices()).length).to.be.equal(2);
                });
        });

        it('Should get all the images', () => {
            const yamlLocation = './ComposeV2/ex2.yaml';
            const filePath     = path.resolve(__dirname, yamlLocation);
            const newService   = new Service('mongo');
            newService.setImage('mongo:latest');
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.addService(newService);
                    return compose.getImageNames();
                })
                .then(images => {
                    expect(images).to.be.deep.equal([
                        "myapp",
                        "redis",
                        "mongo:latest"
                    ]);
                });
        });

        it('Should rename service', () => {
            const yamlLocation = './ComposeV2/ex2.yaml';
            const filePath     = path.resolve(__dirname, yamlLocation);
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.renameService('web', 'app');
                    const service = compose.getServiceByName('app');
                    const order   = compose.getServicesOrder();
                    expect(service).to.exist; // jshint ignore:line
                    expect(service.getName()).to.be.equal('app');
                    expect(order).to.be.deep.equal(['app', 'redis']);
                });
        });

        it('Should add user property for services having user not set and overwrite option not set', () => {
            const yamlLocation = './ComposeV2/ex11.yaml';
            const filePath     = path.resolve(__dirname, yamlLocation);
            const testUser = 'test';
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.setUserForServices(testUser);
                    const serviceWithUser = compose.getServiceByName('with-user');
                    const serviceWithoutUser = compose.getServiceByName('without-user');
                    expect(serviceWithUser.getByName('user')).to.be.equal('from-yaml');
                    expect(serviceWithoutUser.getByName('user')).to.be.equal(testUser);
                });
        });

        it('Should add user property for all services given overwrite option set to true', () => {
            const yamlLocation = './ComposeV2/ex11.yaml';
            const filePath     = path.resolve(__dirname, yamlLocation);
            const testUser = 'test';
            return CFComposeModel.load(filePath)
                .then(compose => {
                    compose.setUserForServices(testUser, true);
                    const serviceWithUser = compose.getServiceByName('with-user');
                    const serviceWithoutUser = compose.getServiceByName('without-user');
                    expect(serviceWithUser.getByName('user')).to.be.equal(testUser);
                    expect(serviceWithoutUser.getByName('user')).to.be.equal(testUser);
                });
        });

        it('Should not add service with the same name', () => {
            const cm      = new CFComposeModel();
            const service = new Service('os');
            cm.addService(service);
            try {
                cm.addService(service);
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Cant add service with the same name');
            }
        });

        it('Should throw an error when adding non network instance', () => {
            const cm = new CFComposeModel();
            try {
                cm.addNetwork();
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Not an instanceof Network');
            }
        });

        it('Should not add network with the same name', () => {
            const cm      = new CFComposeModel();
            const network = new Network('local');
            cm.addNetwork(network);
            try {
                cm.addNetwork(network);
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Cant add network with the same name');
            }
        });

        it('Should throw an error when adding non volume instance', () => {
            const cm = new CFComposeModel();
            try {
                cm.addVolume();
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Not an instanceof Volume');
            }
        });

        it('Should throw an error when default translator not exist', () => {
            const cm = new CFComposeModel();
            try {
                cm.translate();
            } catch (err) {
                expect(err.message).to.be.deep.equal('Default translator not exist');
            }
        });

        it('Should not add volume with the same name', () => {
            const cm     = new CFComposeModel();
            const volume = new Volume('db');
            cm.addVolume(volume);
            try {
                cm.addVolume(volume);
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Cant add volume with the same name');
            }
        });

        it('return undefined when getting service that is not exist', () => {
            const cm = new CFComposeModel();
            expect(cm.getServiceByName('not-exist')).to.be.equal(undefined);
        });

        it('Should throw an error when no setting policy without any policy', () => {
            const cm = new CFComposeModel();
            try {
                cm.setPolicy();
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('No policy given');
            }
        });

        it('Should throw an error when replacing service with non Service instance', () => {
            const cm      = new CFComposeModel();
            const service = new Service('os');
            cm.addService(service);
            try {
                cm.replaceServiceWith();
                throw new Error('');
            } catch (err) {
                expect(err.message).to.be.deep.equal('Not an instanceof Service');
            }
        });

        it('Should throw an error when replacing service with service that has other name', () => {
            const cm       = new CFComposeModel();
            const service1 = new Service('os1');
            const service2 = new Service('os2');
            cm.addService(service1);
            try {
                cm.replaceServiceWith(service2);
            } catch (err) {
                expect(err.message).to.be.deep.equal('Service os2 not exist');
            }
        });

        it('Should throw an error when renameing service that not found', () => {
            const cm = new CFComposeModel();
            try {
                cm.renameService('notfoundservice', 'new-service-name');
            } catch (err) {
                expect(err.message).to.be.deep.equal('notfoundservice not found');
            }
        });

        it('Should throw an error when yaml not supplied to getTranslatorForYaml', () => {
            try {
                CFComposeModel.getTranslatorForYaml();
            } catch (err) {
                expect(err.message).to.be.deep.equal('Yaml not supplied');
            }
        });

        it('Should throw an error when translator not found', () => {
            try {
                CFComposeModel.getTranslatorForYaml({
                    version: 'nofound'
                });
            } catch (err) {
                expect(err.message).to.be.deep.equal('Translator not found');
            }
        });

        it('Throw an error when trying to map over property that not exist', () => {
            const cm = new CFComposeModel();
            return cm._mapOver('field-not-exist', () => {
                throw new Error('Should not get here');
            })
                .catch(err => {
                    expect(err.message).to.be.deep.equal('Property not exist field-not-exist');
                });
        });

    });

    describe('External volumes', () => {
        it('Should support external volumes', () => {
            const filePath = `${__dirname}/ComposeV2/ex6.yaml`;
            return CFComposeModel.load(filePath)
                .then(compose => {
                    return compose.getWarnings()
                        .then(res => {
                            return res;
                        });
                })
                .map(warning => { return warning.format();})
                .then(warnings => {
                    expect(warnings).to.be.deep.equal([
                        {
                            "actual": "local-volume-fail\n[object Object]",
                            "autoFix": false,
                            "displayName": "volumes",
                            "message": "Warning at: volumes.local-volume-fail",
                            "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                            "requireManuallyFix": true,
                            "suggestion": "driver: local"
                        }
                    ]);
                });
        });
    });

    describe('Work with all errors may come in the flow using toString', () => {
        it('Yaml not supplied', () => {
            return CFComposeModel.parse('')
                .catch(err => {
                    expect(err.toString()).to.be.deep.equal(`Error: YAML_NOT_SUPPLIED`);
                });
        });

        it('Yaml cannot be parsed', () => {
            return CFComposeModel.parse(`version: '2`)
                .catch(err => {
                    expect(err.toString()).to.be.deep.equal(`Error: YAML_PARSING_FAILED
With message: unexpected end of the stream within a single quoted scalar at line 2, column 1:\n    \n    ^\nBased on input:\n\n'version: ''2'\n`);
                });
        });

        it('Parser not found', () => {
            return CFComposeModel.parse(`version: '4'`)
                .catch(err => {
                    expect(err.toString())
                        .to
                        .be
                        .deep
                        .equal(`Error: PARSER_NOT_FOUND\nWith message: Cannot find suitable parser for requested input\nBased on input:\n\n{"version":"4"}`);
                });
        });

        it.skip('Translator not found', () => {
            expect(true).to.be.equal(false);
        });

        it('Parsing failed on compose', () => {
            return CFComposeModel.parse(`os:\n imag: bla`)
                .catch(err => {
                    expect(err.toString())
                        .to
                        .be
                        .deep
                        .equal(`Error: PARSING_COMPOSE_FAILED\nWith message: Failed to parse compose object\nBased on input:\n\n"os:\\n imag: bla"`);
                });
        });
    });

});
