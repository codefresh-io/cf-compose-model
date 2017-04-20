'use strict';

const chai            = require('chai');
const sinonChai       = require('sinon-chai');
const ComposeV3Parser = require('./../ComposeV3');
const _               = require('lodash');

const expect = chai.expect;
chai.use(sinonChai);


describe('ComposeV3 parser testing', () => {
    it('All data been parsed correctly', () => {
        const yamlObj = {
            services: {
                redis: {
                    image: 'redis:3.2-alpine',
                    ports: [
                        "6379"
                    ],
                    networks: [
                        "voteapp"
                    ],
                    deploy: {
                        placement: {
                            constraints: ["node.role == manager"]
                        }
                    }
                },
                ds: {
                    image: 'postgres:9.4',
                    volumes: [
                        "db-data:/var/lib/postgresql/data"
                    ],
                    networks: [
                        "voteapp"
                    ],
                    deploy: {
                        placement: {
                            constraints: ["node.role == manager"]
                        }
                    }
                },
                'voting-app': {
                    image: 'gaiadocker/example-voting-app-vote:good',
                    ports: [
                        "80"
                    ],
                    networks: [
                        "voteapp"
                    ],
                    'depends_on': [
                        "redis"
                    ],
                    deploy: {
                        mode: 'replicated',
                        replicas: 2,
                        labels: [
                            "APP=VOTING"
                        ],
                        placement: {
                            constraints: ["node.role == worker"]
                        }
                    }
                },
                'result-app': {
                    image: 'gaiadocker/example-voting-app-result:latest',
                    ports: [
                        "80"
                    ],
                    networks: [
                        "voteapp"
                    ],
                    'depends_on': [
                        "db"
                    ],
                },
                worker: {
                    image: 'gaiadocker/example-voting-app-worker:latest',
                    networks: {
                        voteapp: {
                            aliases: [
                                "workers"
                            ]
                        }
                    },
                    'depends_on': [
                        "db",
                        "redis"
                    ],
                    deploy: {
                        mode: 'replicated',
                        replicas: 2,
                        labels: [
                            "APP=VOTING"
                        ],
                        resources: {
                            limits: {
                                cpus: '0.25',
                                memory: '512M'
                            },
                            reservations: {
                                cpus: '0.25',
                                memory: '256M'
                            }
                        },
                        restart_policy: {
                            condition: 'on-failure',
                            delay: '5s',
                            max_attempts: '3',
                            window: '120s'
                        },
                        update_config: {
                            parallelism: 1,
                            delay: '10s',
                            failure_action: 'continue',
                            monitor: '60s',
                            max_failure_ratio: '0.3'
                        },
                        placement: {
                            constraints: ["node.role == worker"]
                        }
                    }
                }
            },
            networks: {
                voteapp: undefined
            },
            volumes: {
                'db-data': undefined
            }
        };

        return ComposeV3Parser.parse(yamlObj)
            .then(compose => {
                const services = compose.getAllServices();
                expect(_.keys(services)).to.be.deep.equal(_.keys(yamlObj.services));
                _.forEach(services, (service, serviceName) => {
                    const image     = service.getImage();
                    const imageName = image.getName();
                    expect(imageName).to.be.deep.equal(yamlObj.services[serviceName].image);
                    const expectedPorts = _.get(yamlObj.services[serviceName] ,'ports', []);
                    if (_.size(expectedPorts) > 0) {
                        expect(service.getPorts()[0].getTarget()).to.be.equal(yamlObj.services[serviceName].ports[0]);
                    }
                    const expectedVolumes = _.get(yamlObj.services[serviceName] ,'volumes', []);
                    if(_.size(expectedVolumes) > 0){
                        expect(service.getVolumes()[0].getTarget()).to.be.equal(yamlObj.services[serviceName].volumes[0].split(':')[1]);
                    }
                });
                return compose;
            })
            .then((compose) => {
                return compose.mapOverServices((name, instance) => {
                    return instance.mapOverAdditionalData((key, value) => {
                        const originalValue = _.get(yamlObj.services[name], key);
                        expect(originalValue).to.be.equal(value);
                    });
                })
                    .then(() => {
                        return compose;
                    });
            })
            .then(compose => {
                return compose.mapOverVolumes((name, instance) => {
                    const volumeNames = _.keys(yamlObj.volumes);
                    expect(volumeNames).to.include.members([name]);
                    expect(instance.getDriver()).to.be.deep.equal('local');
                })
                    .then(() => {
                        return compose;
                    });
            })
            .then(compose => {
                return compose.mapOverNetworks((name, instance) => {
                    const networkNames = _.keys(yamlObj.networks);
                    expect(networkNames).to.include.members([name]);
                    expect(instance.getDriver()).to.be.deep.equal('bridge');
                })
                    .then(() => {
                        return compose;
                    });
            });
    });

    it('Should throw error if found unsupported fields at first or second level', () => {
        const yamlObj = {
            services: {
                redis: {
                    image: 'redis:3.2-alpine',
                    ports: [
                        ['type not match for single port'],
                        "80:80"
                    ],
                    'no-service-fields': [
                        'array', 'data', 'should', 'remain'
                    ]
                },
            },
            volumes: {
                'db-data': undefined
            },
            'field-not-exist-on-compose-v1': 'the value should be kept as well'
        };

        return ComposeV3Parser.parse(yamlObj)
            .then(() => {
                throw new Error('Should not come here');
            })
            .catch(err => {
                expect(err.message).to.be.deep.equal('PARSING_COMPOSE_FAILED');
                expect(err).to.have.keys([
                    "_basedOnInput",
                    "_errors",
                    "_warnings",
                    "isCmError"
                ]);
                expect(err.getErrors().length).to.be.equal(3);
                expect(err.getErrors()[0].format()).to.be.deep.equal({
                    "fieldData": [
                        "type not match for single port"
                    ],
                    "fieldName": "ports",
                    "message": "Port must be number, got Array: type not match for single port",
                    "requireManuallyFix": true
                });
                expect(err.getErrors()[1].format()).to.be.deep.equal({
                    "data": [
                        "array",
                        "data",
                        "should",
                        "remain"
                    ],
                    "message": "Field 'no-service-fields' is not supported by compose",
                    "name": "FIELD_NOT_SUPPORTED"
                });
                expect(err.getErrors()[2].format()).to.be.deep.equal({
                    "fieldData": "the value should be kept as well",
                    "fieldName": "field-not-exist-on-compose-v1",
                    "message": "field-not-exist-on-compose-v1 is not supported by compose v3",
                    "requireManuallyFix": true
                });
            });
    });
});

