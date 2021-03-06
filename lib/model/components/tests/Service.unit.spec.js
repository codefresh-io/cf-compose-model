'use strict';

const chai                 = require('chai');
const sinonChai            = require('sinon-chai');
const Service              = require('../service/Service');
const Port                 = require('../service/Port');
const Image                = require('../service/Image');
const Volume               = require('../service/Volume');
const NotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

const expect = chai.expect;
chai.use(sinonChai);


describe('Service testing', () => {
    describe('Basic:', () => {
        let service;
        beforeEach(() => {
            service = new Service('my-service');
        });

        it('addLabel to array', () => {
            service.addLabel('key', 'value');
            expect(service.labels).to.be.deep.equal([
                "key=value"
            ]);
        });

        it('Should add to obj', () => {
            const service  = new Service('ok');
            service.labels = {
                key: 'va1'
            };
            service.addLabel('key2', 'val2');
            expect(service.getLabel('key2')).to.be.deep.equal('val2');
        });

        it('addPort', () => {
            const port = new Port('80:80');
            service.addPort(port);
            const ports = service.getPorts();
            expect(ports[0].getSource()).to.be.equal('80');
            expect(ports[0].getTarget()).to.be.equal('80');

        });

        it('addVolume', () => {
            const volume = new Volume('./:/app');
            service.addVolume(volume);

            const volumes = service.getVolumes();
            expect(volumes[0].getAccessMode()).to.be.equal(undefined);
            expect(volumes[0].getTarget()).to.be.equal('/app');
            expect(volumes[0].getSource()).to.be.equal('./');

        });

        it('addEnvironmentVariable to array', () => {
            service.addEnvironmentVariable('key', 'value');
            expect(service.environment).to.be.deep.equal([
                "key=value"
            ]);
        });

        it('addEnvironmentVariable to obj', () => {
            const service = new Service('ok');

            service.environment = { 'key': 'value' };
            service.addEnvironmentVariable('key2', 'value2');

            expect(service.getEnvironmentVarialbe('key2')).to.be.deep.equal('value2');
        });

        it('Should get fields from service', () => {
            const service = new Service('os');
            service.setAdditionalData('expose', ['8080']);
            expect(service.get(['expose', 'image', 'ports', 'volumes'])).to.be.deep.equal({
                "expose": [
                    "8080"
                ]
            });
        });

        it('Replace image', () => {
            const service = new Service('web');
            service.setImage('ubuntu');
            service.replaceImageWith('redis:latest');
            expect(service.getImage().getRepo()).to.be.deep.equal('redis');
            expect(service.getImage().getTag()).to.be.deep.equal('latest');
        });

        it('Should return undefined when getting labes and labels not exist', () => {
            const service = new Service('os');
            const label   = service.getLabel('not-exist');
            expect(label).to.be.equal(undefined);
        });

        it('Should return undefined when getting env vars and they are not exist', () => {
            const service = new Service('os');
            const env     = service.getEnvironmentVarialbe('not-exist');
            expect(env).to.be.equal(undefined);
        });

        it('Get all environment variables', () => {
            const service = new Service('web');
            service.addEnvironmentVariable('val1', 'key1');
            service.addEnvironmentVariable('val2', 'key2');
            service.addEnvironmentVariable('val3', 'key3');
            service.addEnvironmentVariable('val4', 'key4');
            service.addEnvironmentVariable('val5', 'key5');
            const envVars = service.getAllEvnironmentVarialbes();
            expect(envVars).to.be.deep.equal([
                "val1=key1",
                "val2=key2",
                "val3=key3",
                "val4=key4",
                "val5=key5",
            ]);
        });

        it('Should map over all the environemnt variables', () => {
            const service = new Service('web');
            service.addEnvironmentVariable('key1', 'val1');
            service.addEnvironmentVariable('key2', 'val2');
            service.addEnvironmentVariable('key3', 'val3');
            service.addEnvironmentVariable('key4', 'val4');
            service.addEnvironmentVariable('key5', 'val5');
            return service.mapOverEnvironments((key, value) => {
                expect(key).to.have.string('key');
                expect(value).to.have.string('val');
            });
        });

        it('Should get environment by key', () => {
            const service = new Service('web');
            service.addEnvironmentVariable('key1', 'val1');
            service.addEnvironmentVariable('key2', 'val2');
            service.addEnvironmentVariable('key3', 'val3');
            service.addEnvironmentVariable('key4', 'val4');
            service.addEnvironmentVariable('key5', 'val5');
            expect(service.getEnvironmentVarialbe('key2')).to.be.equal('val2');
        });

        it('Should get all labels', () => {
            const service = new Service('web');
            service.addLabel('val1', 'key1');
            service.addLabel('val2', 'key2');
            service.addLabel('val3', 'key3');
            service.addLabel('val4', 'key4');
            service.addLabel('val5', 'key5');
            const labels = service.getAllLabels();
            expect(labels).to.be.deep.equal([
                "val1=key1",
                "val2=key2",
                "val3=key3",
                "val4=key4",
                "val5=key5",
            ]);
        });

        it('Should map over all the labels variables', () => {
            const service = new Service('web');
            service.addLabel('key1', 'val1');
            service.addLabel('key2', 'val2');
            service.addLabel('key3', 'val3');
            service.addLabel('key4', 'val4');
            service.addLabel('key5', 'val5');
            return service.mapOverLabels((key, value) => {
                expect(key).to.have.string('key');
                expect(value).to.have.string('val');
            });
        });

        it('Should get environment by key', () => {
            const service = new Service('web');
            service.addLabel('key1', 'val1');
            service.addLabel('key2', 'val2');
            service.addLabel('key3', 'val3');
            service.addLabel('key4', 'val4');
            service.addLabel('key5', 'val5');
            expect(service.getLabel('key2')).to.be.equal('val2');
        });

        it('Should add metadata', () => {
            const service = new Service('web');
            service.addMetadata('key1', {})
                .addMetadata('key2', 'string')
                .addMetadata('key3', []);

            expect(service.getMetadata()).to.be.deep.equal({
                "key1": {},
                "key2": "string",
                "key3": []
            });
        });

        it('Should replace env vars', () => {
            const service = new Service('web');
            service.addEnvironmentVariable('key1', 'val1');
            service.addEnvironmentVariable('key2', 'val2');
            service.addEnvironmentVariable('key3', 'val3');
            service.replaceEnvironmentVariableValueByKey('key1', 'val');

            return service.mapOverEnvironments((key, value) => {
                if (key === 'key1') {
                    expect(value).to.be.equal('val');
                }
            });

        });

        it('Should check if env var exist in service', () => {
            const service = new Service('web');
            service.addEnvironmentVariable('key1', 'val1');
            service.addEnvironmentVariable('key2', 'val2');
            service.addEnvironmentVariable('key3', 'val3');
            expect(service.isKeyExistInEnvironmentVariables('key1')).to.be.equal(true);
            expect(service.isKeyExistInEnvironmentVariables('key')).to.be.equal(false);
        });

        it('Should map over the service except image, ports, volumes, envs and labels', () => {
            const service = new Service('web');
            service.setAdditionalData('Dockerfile', './Dockerfile');
            service.setAdditionalData('command', ['ls']);
            service.addEnvironmentVariable('key1', 'val1');
            service['not-supported-by-policy'] =
                new NotSupportedByPolicy('not-supported-by-policy', 'some-data', 'use: ', 'the field not supported');
            return service.mapOverAdditionalData((key, value) => {
                if (key === 'Dockerfile') {
                    expect(value).to.be.deep.equal('./Dockerfile');
                } else if (key === 'environment') {
                    expect(value).to.be.deep.equal(['key1=val1']);
                } else if (key === 'not-supported-by-policy') {
                    expect(value).to.be.an.instanceof(NotSupportedByPolicy);

                } else {
                    expect(value).to.be.deep.equal(['ls']);
                }
            });
        });

        it('Port publishing', () => {
            const service = new Service('os');
            expect(service.shouldPublishAllPorts()).to.be.equal(false);
            service.publishAllPorts();
            expect(service.shouldPublishAllPorts()).to.be.equal(true);
            service.unPublishAllPorts();
            expect(service.shouldPublishAllPorts()).to.be.equal(false);
        });

        it('Should throw an error when setting port original type that is not arrau or obj', () => {
            const service = new Service('ok');
            try {
                service.setPortsOriginalType();
            } catch (err) {
                expect(err.message).to.be.deep.equal('Ports holder type should be Array or Object');
            }
        });

        it('Should get port original type when type not setup', () => {
            const service = new Service('ok');
            expect(service.getPortsOriginalType()).to.be.deep.equal('Array');
        });

        it('Should throw an error when setting volue original type that is not arrau or obj',
            () => {
                const service = new Service('ok');
                try {
                    service.setVolumesOriginalType();
                } catch (err) {
                    expect(err.message)
                        .to
                        .be
                        .deep
                        .equal('Volumes holder type should be Array or Object');
                }
            });

        it('Should get volumes original type when type not setup', () => {
            const service = new Service('ok');
            expect(service.getVolumesOriginalType()).to.be.deep.equal('Array');
        });

        it('Should map over envs when environments are object', () => {
            const service       = new Service('ok');
            service.environment = {
                key: 'val'
            };
            return service.mapOverEnvironments((key, val) => {
                expect(key).to.be.deep.equal('key');
                expect(val).to.be.deep.equal('val');
            });
        });

        it('Should map over labels when labels are object', () => {
            const service = new Service('ok');
            service.labels = {
                key: 'val'
            };
            return service.mapOverLabels((key, val) => {
                expect(key).to.be.deep.equal('key');
                expect(val).to.be.deep.equal('val');
            });
        });

        it('replaceEnvironmentVariableValueByKey for obj', () => {
            const service       = new Service('ok');
            service.environment = {
                key: 'val'
            };
            service.replaceEnvironmentVariableValueByKey('key', 'val2');
            expect(service.getEnvironmentVarialbe('key')).to.be.equal('val2');
        });

        it('Should return undefined when trying to replace env var that is not exist', () => {
            const service = new Service('ok');
            expect(service.replaceEnvironmentVariableValueByValue('not-exist'))
                .to
                .be
                .equal(undefined);
        });



        it('replaceEnvironmentVariableValueByKey for obj ', () => {
            const service       = new Service('ok');
            service.environment = {
                key: 'val'
            };
            service.replaceEnvironmentVariableValueByValue('val', 'val2');
            expect(service.getEnvironmentVarialbe('key')).to.be.equal('val2');
        });

        it('isValueExistInEnvironmentVariables for obj', () => {
            const service       = new Service('ok');
            service.environment = {
                key: 'val'
            };
            expect(service.isValueExistInEnvironmentVariables('val')).to.be.equal(true);
        });

        describe('Order testing', () => {
            let service;
            beforeEach(() => {
                service = new Service('web');
            });

            const tests = [{
                title: 'setImage',
                invokeFunc: 'setImage',
                funcParams: 'redis',
                expectedOrder: ['image']
            }, {
                title: 'setImage',
                invokeFunc: 'setImage',
                funcParams: 'redis',
                expectedOrder: ['image']
            }, {
                title: 'addPort',
                invokeFunc: 'addPort',
                funcParams: '80:80',
                expectedOrder: ['ports']
            }, {
                title: 'addVolume',
                invokeFunc: 'addVolume',
                funcParams: '/app',
                expectedOrder: ['volumes']
            }, {
                title: 'addLabel',
                invokeFunc: 'addLabel',
                funcParams: 'key=value',
                expectedOrder: ['labels']
            }, {
                title: 'addLabel',
                invokeFunc: 'addLabel',
                funcParams: { key: 'value' },
                expectedOrder: ['labels']
            }, {
                title: 'addEnvironmentVariable',
                invokeFunc: 'addEnvironmentVariable',
                funcParams: 'key=value',
                expectedOrder: ['environment']
            }, {
                title: 'addEnvironmentVariable',
                invokeFunc: 'addEnvironmentVariable',
                funcParams: { key: 'value' },
                expectedOrder: ['environment']
            }
            ];

            tests.map(test => {
                it(`Testing function ${test.title}`, () => {
                    expect(service._order).to.be.deep.equal([]);
                    service[test.invokeFunc](test.funcParams);
                    expect(service._order).to.be.deep.equal(test.expectedOrder);
                });
            });

        });

        describe('Merging services', () => {
            const tests = [
                {
                    title: 'Simple merge',
                    hostService: new Service('web'),
                    guestService: new Service('notweb'),
                    expectedService: new Service('web')
                },
                {
                    title: 'If image not exist on host take it from the guest if exist',
                    hostService: new Service('web').addVolume('app').addPort('8080'),
                    guestService: new Service('notweb').setImage('redis').addPort('9090'),
                    expectedService: new Service('web').addVolume('app')
                        .addPort('8080')
                        .setImage('redis')
                        .addPort('9090')
                },
                {
                    title: 'Do not overwrite environment variables of the host',
                    hostService: new Service('web').addEnvironmentVariable('key1', 'val1')
                        .addEnvironmentVariable('key2', 'val2'),
                    guestService: new Service('notweb').addEnvironmentVariable('key1', 'val2')
                        .addEnvironmentVariable('key3', 'val3'),
                    expectedService: new Service('web').addEnvironmentVariable('key1', 'val1')
                        .addEnvironmentVariable('key2', 'val2')
                        .addEnvironmentVariable('key3', 'val3')
                },
                {
                    title: 'Do not overwrite labels of the host',
                    hostService: new Service('web').addLabel('key1', 'val1')
                        .addLabel('key2', 'val2'),
                    guestService: new Service('notweb').addLabel('key1', 'val2')
                        .addLabel('key3', 'val3'),
                    expectedService: new Service('web').addLabel('key1', 'val1')
                        .addLabel('key2', 'val2')
                        .addLabel('key3', 'val3')
                },
                {
                    title: 'Do not overwrite image of the host',
                    hostService: new Service('web').setImage('redis'),
                    guestService: new Service('notweb').setImage('ubuntu'),
                    expectedService: new Service('web').setImage('redis'),
                },
                {
                    title: 'Do not overwrite image of the host',
                    hostService: new Service('web').setImage('redis'),
                    guestService: new Service('notweb').setImage('ubuntu'),
                    expectedService: new Service('web').setImage('redis'),
                },
                {
                    title: 'Other data should be added from the guest if not exist on host',
                    hostService: new Service('web').setAdditionalData('command', ['rm -rf /']),
                    guestService: new Service('notweb').setAdditionalData('command', 'ls -la')
                        .setAdditionalData('expose', ['8080']),
                    expectedService: new Service('web').setAdditionalData('command', ['rm -rf /'])
                        .setAdditionalData('expose', ['8080']),
                },
                {
                    title: 'Should merge volume',
                    hostService: new Service('web').addVolume('vol1'),
                    guestService: new Service('notweb').addVolume('vol2'),
                    expectedService: new Service('web').addVolume('vol1').addVolume('vol2')
                }
            ];

            tests.map(test => {
                it(test.title, () => {
                    return test.hostService.mergeWith(test.guestService)
                        .then(mergedService => {
                            expect(mergedService).to.be.deep.equal(test.expectedService);
                        });
                });
            });

            it('Should throw an error when otherService is not istance of Service', () => {
                try {
                    new Service('ok').mergeWith({});
                } catch (err) {
                    expect(err.message)
                        .to
                        .be
                        .deep
                        .equal('Given service is not with type of Service');
                }
            });
        });

        describe('isPortExist', () => {
            const tests = [
                {
                    title: 'Same host, same target, different protocol',
                    shouldPass: true,
                    candidatePort: new Port('80:80/udp'),
                    service: new Service('testing-service').addPort('80:80/tcp').addPort('81:81'),
                    result: [new Port('80:80/tcp'), new Port('81:81'), new Port('80:80/udp')]
                },
                {
                    title: 'no host, same target, no protocol',
                    shouldPass: true,
                    candidatePort: new Port('80'),
                    service: new Service('testing-service').addPort('90'),
                    result: [new Port('90'), new Port('80')]
                },
                {
                    title: 'same host, different targets, same protocol',
                    shouldPass: false,
                    candidatePort: new Port('80:80/udp'),
                    service: new Service('testing-service').addPort('80:80/udp'),
                    result: 'Error: PORT_EXIST'
                }
            ];

            tests.map(test => {
                it(test.title, () => {
                    if (test.shouldPass) {
                        test.service.addPort(test.candidatePort);
                        expect(test.service.getPorts()).to.be.deep.equal(test.result);
                    } else {
                        try {
                            test.service.addPort(test.candidatePort);
                            throw new Error('bad...');
                        } catch (err) {
                            expect(err.toString()).to.be.equal(test.result);
                        }
                    }
                });
            });

        });

    });

    describe('Work with interface', () => {
        let service;
        beforeEach(() => {
            service = new Service('os');
        });

        describe('Adding ports', () => {
            it('Should add port', () => {
                service.addPort('8080');
                service.addPort(8081);
                service.addPort('443:8443');
                expect(service.getPorts()[0].getTarget()).be.equal('8080');
                expect(service.getPorts()[1].getTarget()).be.equal('8081');
                expect(service.getPorts()[2].getTarget()).be.equal('8443');
                expect(service.getPorts()[2].getSource()).be.equal('443');
            });

            it('Should add port using Port instance', () => {
                const p1 = new Port('80');
                const p2 = new Port('81');
                service.addPort(p1).addPort(p2);
                expect(service.getPorts()[0].getTarget()).be.equal('80');
                expect(service.getPorts()[1].getTarget()).be.equal('81');
            });


            it('Should throw an error if port throw validation error', () => {
                try {
                    service.addPort('abc');
                    throw new Error('');
                } catch (err) {
                    expect(err.message).to.be.equal('TYPE_NOT_MATCH');
                }
            });

            it('Should throw errors when adding ports that already exist', () => {
                try {
                    service.addPort('8080:8080');
                    service.addPort('8080:8080');
                    throw new Error();
                } catch (err) {
                    expect(err.message).to.be.equal('PORT_EXIST');
                }
            });

        });

        describe('Adding volumes', () => {
            it('Should add volume', () => {
                service.addVolume('./app');
                const volumes = service.getVolumes();
                expect(volumes[0].getTarget()).to.be.equal('./app');
            });

            it('Should throw an error on adding existing volume', () => {
                try {
                    service.addVolume('./app:/dir1');
                    service.addVolume('./app:/dir1');
                    throw new Error('');
                } catch (err) {
                    expect(err.message).to.be.deep.equal('VOLUME_EXIST');
                }
            });

            it('Should throw volume when adding volumes with same target', () => {
                try {
                    service.addVolume('/dir1');
                    service.addVolume('/dir1');
                    throw new Error('');
                } catch (err) {
                    expect(err.message).to.be.deep.equal('VOLUME_EXIST');
                }
            });

            it('Should not throw error when adding two volume with different targetsor sources',
                () => {
                    service.addVolume('./app:/dir1');
                    service.addVolume('./app:/dir2');

                    service.addVolume('./app1:/dir');
                    service.addVolume('./app2:/dir');

                    expect(service.getVolumes().length).to.be.equal(4);
                });

            it('Should throw an error if validation failed', () => {
                try {
                    service.addVolume();
                } catch (err) {
                    expect(err.message).to.be.equal('TYPE_NOT_MATCH');
                }
            });

        });

        describe('Setting image', () => {
            it('Should add image', () => {
                service.setImage('google/sdk:0.91-b');
                expect(service.getImage().getName()).to.be.equal('google/sdk:0.91-b');
            });

            it('Should add image using Image instace', () => {
                service.setImage(new Image('google/sdk:0.91-b'));
                expect(service.getImage().getName()).to.be.equal('google/sdk:0.91-b');
            });

            it('Should throw error if validation failed', () => {
                try {
                    service.setImage();
                } catch (err) {
                    expect(err.message).to.be.equal('TYPE_NOT_MATCH');
                }
            });

        });

        describe('Map over exposed ports', () => {
            const tests = [
                {
                    title: 'Ports have only target',
                    serviceToTest: new Service('test-service')
                        .addPort('8080')
                        .addPort('8181')
                        .addPort('443')
                        .addPort('3276'),
                    expectedPorts: ['8080', '8181', '443', '3276']
                },
                {
                    title: 'Ports have targets and hosts',
                    serviceToTest: new Service('test-service')
                        .addPort('8080:80')
                        .addPort('8181:81')
                        .addPort('443')
                        .addPort('3276'),
                    expectedPorts: ['80', '81', '443', '3276']
                },
                {
                    title: 'Ports have range',
                    serviceToTest: new Service('test-service')
                        .addPort('3000-3005')
                        .addPort('8181:81')
                        .addPort('3276'),
                    expectedPorts: ['81', '3276', '3000', '3001', '3002', '3003', '3004', '3005']
                }
            ];

            tests.map(test => {
                it(test.title, (done) => {
                    test.serviceToTest.mapOverExposedPorts((portString) => {
                        expect(test.expectedPorts).to.contain(portString);
                    })
                        .then(() => {
                            done();
                        })
                        .catch(done);
                });
            });
        });

        describe('Environment variables', () => {
            it('Should find the value of environment variable', () => {
                const service = new Service('ok');
                service.addEnvironmentVariable('key', 'value');
                service.addEnvironmentVariable('key1', 'value1');

                expect(service.isValueExistInEnvironmentVariables('value')).to.be.equal(true);
                expect(service.isValueExistInEnvironmentVariables('value1')).to.be.equal(true);
                expect(service.isValueExistInEnvironmentVariables('value2')).to.be.equal(false);
            });

            it('Should replace the value of environment variable key', () => {
                const service = new Service('ok');
                service.addEnvironmentVariable('key', 'value');
                service.addEnvironmentVariable('key1', 'value1');

                service.replaceEnvironmentVariableValueByValue('value', 'value2');
                expect(service.getEnvironmentVarialbe('key')).to.be.deep.equal('value2');
                expect(service.getEnvironmentVarialbe('key1')).to.be.deep.equal('value1');
            });

            it('Should return undefined when adding env var', () => {
                const service = new Service('os');
                service.addEnvironmentVariable('key', 'value');
                const res = service.addEnvironmentVariable('key', 'other-value');
                expect(res).to.be.equal(undefined);
            });
        });
    });

    describe('Negative:', () => {
        it(`Shouldn't init service that have empty string in the name`, () => {
            try {
                new Service('');
                throw new Error('');
            } catch (err) {
                expect(err.toString()).to.have.string('Service must have a name');
            }
        });
    });

});
