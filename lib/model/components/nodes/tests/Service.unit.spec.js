'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Service   = require('./../Service');

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
            service.addPort('80', '80');
            expect(service.ports).to.be.deep.equal([{
                stringValue: "80:80",
                source: '80',
                target: '80',
                warnings: [],
                protocol: undefined
            }]);
        });

        it('addVolume', () => {
            service.addVolume('/app', './');
            expect(service.volumes).to.be.deep.equal([{
                    "accessMode": undefined,
                    "source": "./",
                    "stringValue": "./:/app",
                    "target": "/app",
                    "warnings": []
                }
            ]);
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
            } catch(err){
                expect(err.toString()).to.have.string('Service must has a name');
            }
        });
    });
});