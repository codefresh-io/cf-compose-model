'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const expect    = chai.expect;
const Accessibility = require('./../ServiceAccessibility');
chai.use(sinonChai);

describe('Service Accessibility testing', () => {

    it('context should not be supported', () => {
        expect(new Accessibility().isContextSupported()).to.be.equal(false);
    });

    describe('privileged', () => {
        it('supported', () => {
            const acc = new Accessibility();
            acc.allowPrivilegedMode();
            expect(acc.isPrivilegedModeSupported()).to.be.deep.equal(true);
        });

        it('not supported', () => {
            expect((new Accessibility()).isPrivilegedModeSupported()).to.be.deep.equal(false);
        });
    });

});

