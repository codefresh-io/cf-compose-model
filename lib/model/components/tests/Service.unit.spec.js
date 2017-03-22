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
               if(key === 'key1'){
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
            return service.mapOverAdditionalData((key, value) => {
               if(key === 'Dockerfile'){
                   expect(value).to.be.deep.equal('./Dockerfile');
               } else {
                   expect(value).to.be.deep.equal(['ls']);
               }
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