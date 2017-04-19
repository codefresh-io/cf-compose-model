'use strict';

const chai                   = require('chai');
const sinonChai              = require('sinon-chai');
const ComposeV1ServiceParser = require('./../Service');
const Service                = require('./../../../components/service/Service');
const expect                 = chai.expect;
const ServiceComponent                  = require('../../../components/service/Service');
const FieldNotSupportedByPolicy = require('../../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
chai.use(sinonChai);

describe('Compose v1 service parser', () => {
    const tests = [
        {
            title: 'Basic parse',
            mockObj: {
                web: {}
            },
            expectedService: new Service('web')
        },
        {
            title: 'Should parse with image',
            mockObj: {
                web: {
                    image: 'ubuntu'
                }
            },
            expectedService: new Service('web').setImage('ubuntu')
        },
        {
            title: 'Should parse with ports as array',
            mockObj: {
                web: {
                    ports: ["80:80", "81:81"]
                }
            },
            expectedService: new Service('web').addPort('80:80').addPort('81:81')
        },
        {
            title: 'Should parse with environment variables as object',
            mockObj: {
                web: {
                    environment: [
                        "key1=val1",
                        "key2=val2"
                    ]
                }
            },
            expectedService: new Service('web').addEnvironmentVariable('key1', 'val1').addEnvironmentVariable('key2', 'val2')
        },
        {
            title: 'Should parse with environment variables as object',
            mockObj: {
                web: {
                    command: ['ls', '-la']
                }
            },
            expectedService: new Service('web').setAdditionalData('command', ['ls', '-la'])
        }
    ];

    tests.map(test => {
        it(test.title, () => {
            const yamlString             = test.mockObj.web;
            const composeV1ServiceParser = new ComposeV1ServiceParser('web', yamlString);
            return composeV1ServiceParser.parse({
                isPortMappingSupported(){
                    return false;
                }
            })
                .then(service => {
                    expect(service).to.be.deep.equal(test.expectedService);
                });
        });
    });


    describe('Parsing with errors', () => {
        it('Should get errors when image is not valid', () => {
            const yaml   = {
                os: {
                    image: {
                        key: 'value'
                    }
                }
            };
            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .then(() => {
                    throw new Error('BAD');
                })
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": {
                            "key": "value"
                        },
                        "fieldName": "image",
                        "message": "Image must be string, got Object",
                        "requireManuallyFix": true
                    });
                });

        });

        it('Should get errors when ports are not array or object', () => {
            const yaml = {
                os: {
                    ports: 8080
                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .then(() => {
                    throw new Error('BAD');
                })
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": 8080,
                        "fieldName": "ports",
                        "message": "Ports must be array or object, got number",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should get errors when port have invalid syntax', () => {
            const yaml = {
                os: {
                    ports: [
                        "abc:abc"
                    ]
                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .then(() => {
                    throw new Error('BAD');
                })
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": "abc:abc",
                        "fieldName": "ports",
                        "message": "Port must be number, got string: abc:abc",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should get errors when ports are object with invalid syntax on port', () => {
            const yaml = {
                os: {
                    ports: {
                        key: 'val'
                    }

                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .then(() => {
                    throw new Error('BAD');
                })
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": "key:val",
                        "fieldName": "ports",
                        "message": "Port must be number, got string: key:val",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Shout get errors when volumes is not array or object', () => {
            const yaml = {
                os: {
                    volumes: 'string'
                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .catch(err => {
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": "string",
                        "fieldName": "volumes",
                        "message": "Volumes must be array or object, got string",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should get errors when volumes syntax is invalid in array', () => {
            const yaml = {
                os: {
                    volumes: [
                        [],
                        []
                    ]
                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .catch(err => {
                    expect(err.errors.length).to.be.equal(2);
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": [],
                        "fieldName": "volumes",
                        "message": "Volume must be string, got Array: ",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should get errors when volumes syntax is invalid in object', () => {
            const yaml = {
                os: {
                    volumes: {
                        key: undefined
                    }
                }
            };

            const parser = new ComposeV1ServiceParser('os', yaml.os);
            return parser.parse({})
                .catch(err => {
                    expect(err.errors.length).to.be.equal(1);
                    expect(err.errors[0].format()).to.be.deep.equal({
                        "fieldData": "key:undefined",
                        "fieldName": "volumes",
                        "message": "Port must be string or number, got string",
                        "requireManuallyFix": true
                    });
                });
        });

        it('Should get errors when volumes when service fail in object', () => {

            const parser = new ComposeV1ServiceParser('os', 'os');
            const serviceComponent = {
                setVolumesOriginalType: () => {

                },
                addVolume: () => {
                    throw 'error';
                }
            };
            parser._actOnSpecialField(serviceComponent, 'volumes', {'/a': '/b'});
            expect(parser.errors).to.have.length(1);
            expect(parser.errors[0]).to.be.equal('error');
        });

        it('Build not supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isBuildSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'build', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('build')).to.be.equal('1234');

        });

        it('Build not supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isBuildSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'build', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('build') instanceof FieldNotSupportedByPolicy).to.be.equal(true);


        });

        it('container_name not supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContainerNameSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'container_name', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('container_name')).to.be.equal('1234');

        });

        it('container_name  supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContainerNameSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'container_name', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('container_name') instanceof FieldNotSupportedByPolicy).to.be.equal(true);

        });

        it('context not supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContextSupported: () => {
                    return true;
                }
            });
            service._actOnSpecialField(serviceInstance, 'context', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('context')).to.be.equal('1234');

        });

        it('context  supported ', () => {

            const service         = new ComposeV1ServiceParser('my-service', 'my-value');
            const serviceInstance = new ServiceComponent('service component');
            service.setAccessibility({
                isContextSupported: () => {
                    return false;
                }
            });
            service._actOnSpecialField(serviceInstance, 'context', '1234');
            expect(service.errors).to.have.length(0);
            expect(serviceInstance.getByName('context') instanceof FieldNotSupportedByPolicy).to.be.equal(true);

        });


    });
});