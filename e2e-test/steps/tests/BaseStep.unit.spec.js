'use strict';

const chai       = require('chai');
const sinonChai  = require('sinon-chai');
const proxyquire = require('proxyquire'); // jshint ignore:line
const BaseStep = require('./../BaseStep');

const expect = chai.expect;
chai.use(sinonChai);

describe('Base steps testimg', () => {
    it('Should throw error when step has no type', () => {
        try {
            new BaseStep();
        } catch (err) {
            expect(err.message).to.be.equal('Step must have type');
        }
    });

    it('Should get step type', () => {
        expect(new BaseStep('some-type').getType()).to.be.equal('some-type');
        expect(new BaseStep('some-type', 'step-name').getName()).to.be.equal('step-name');
    });

    it('execType should throw an error when not implemented', () => {
        const step = new BaseStep('some-type');
        try {
            step.exec();
        } catch (err) {
            expect(err.message).to.be.deep.equal('Not implemented');
        }
    });
});