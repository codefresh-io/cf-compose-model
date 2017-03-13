'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Service   = require('./../Service');
const Port      = require('./../Port');
const Volume    = require('./../ServiceVolume');

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
            const port = Port.parse('80:80', 'ports');
            service.addPort(port);
            const ports = service.getPorts();
            expect(ports[0].getSource()).to.be.equal('80');
            expect(ports[0].getTarget()).to.be.equal('80');

        });

        it('addVolume', () => {
            const volume = Volume.parse('./:/app', 'volumes');
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