'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Service   = require('../service/Service');
const Port      = require('../service/Port');
const Volume    = require('../service/Volume');

const expect = chai.expect;
chai.use(sinonChai);


describe('Service testing', () => {
    describe('Basic:', () => {
        let service;
        beforeEach(() => {
            service = new Service('my-service');
        });

        it('addLabel', () => {
            service.addLabel('key', 'value');
            expect(service.labels).to.be.deep.equal([
                "key=value"
            ]);
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

        it('addEnvironmentVariable', () => {
            service.addEnvironmentVariable('key', 'value');
            expect(service.environment).to.be.deep.equal([
                "key=value"
            ]);
        });

        it('Replace image', () => {
            const service = new Service('web');
            service.setImage('ubuntu');
            service.replaceImageWith('redis:latest');
            expect(service.getImage().getRepo()).to.be.deep.equal('redis');
            expect(service.getImage().getTag()).to.be.deep.equal('latest');
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
            service.replaceEnvironmentVariableValue('key1', 'val');

            return service.mapOverEnvironments((key, value) => {
                if (key === 'key1') {
                    expect(value).to.be.equal('val');
                }
            });

            // TODO : test with obj also
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
            return service.mapOverAdditionalData((key, value) => {
                if (key === 'Dockerfile') {
                    expect(value).to.be.deep.equal('./Dockerfile');
                } else if (key === 'environment') {
                    expect(value).to.be.deep.equal(['key1=val1']);
                } else {
                    expect(value).to.be.deep.equal(['ls']);
                }
            });
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
            }];

            tests.map(test => {
                it(`Testing function ${test.title}`, () => {
                    expect(service._order).to.be.deep.equal([]);
                    service[test.invokeFunc](test.funcParams);
                    expect(service._order).to.be.deep.equal(test.expectedOrder);
                });
            });

        });

        describe('Mergin services', () => {
            const tests = [{
                title: 'Simple merge',
                hostService: new Service('web'),
                guestService: new Service('notweb'),
                expectedService: new Service('web')
            }, {
                title: 'If image not exist on host take it from the guest if exist',
                hostService: new Service('web').addVolume('app').addPort('8080'),
                guestService: new Service('notweb').setImage('redis'),
                expectedService: new Service('web').addVolume('app').addPort('8080').setImage('redis')
            }, {
                title: 'Do not overwrite environment variables of the host',
                hostService: new Service('web').addEnvironmentVariable('key1', 'val1').addEnvironmentVariable('key2', 'val2'),
                guestService: new Service('notweb').addEnvironmentVariable('key1', 'val2').addEnvironmentVariable('key3', 'val3'),
                expectedService: new Service('web').addEnvironmentVariable('key1', 'val1').addEnvironmentVariable('key2', 'val2').addEnvironmentVariable('key3', 'val3')
            }, {
                title: 'Do not overwrite labels of the host',
                hostService: new Service('web').addLabel('key1', 'val1').addLabel('key2', 'val2'),
                guestService: new Service('notweb').addLabel('key1', 'val2').addLabel('key3', 'val3'),
                expectedService: new Service('web').addLabel('key1', 'val1').addLabel('key2', 'val2').addLabel('key3', 'val3')
            }, {
                title: 'Do not overwrite image of the host',
                hostService: new Service('web').setImage('redis'),
                guestService: new Service('notweb').setImage('ubuntu'),
                expectedService: new Service('web').setImage('redis'),
            }, {
                title: 'Do not overwrite image of the host',
                hostService: new Service('web').setImage('redis'),
                guestService: new Service('notweb').setImage('ubuntu'),
                expectedService: new Service('web').setImage('redis'),
            }, {
                title: 'Other data should be added from the guest if not exist on host',
                hostService: new Service('web').setAdditionalData('command', ['rm -rf /']),
                guestService: new Service('notweb').setAdditionalData('command', 'ls -la').setAdditionalData('expose', ['8080']),
                expectedService: new Service('web').setAdditionalData('command', ['rm -rf /']).setAdditionalData('expose', ['8080']),
            }, {
                title: 'Should merge volume',
                hostService: new Service('web').addVolume('vol1'),
                guestService: new Service('notweb').addVolume('vol2'),
                expectedService: new Service('web').addVolume('vol1').addVolume('vol2')
            }];

            tests.map(test => {
                it(test.title, () => {
                    return test.hostService.mergeWith(test.guestService)
                        .then(mergedService => {
                            expect(mergedService).to.be.deep.equal(test.expectedService);
                        });
                });
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