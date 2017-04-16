'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const BaseViolation    = require('../CmBaseViolation');

const expect = chai.expect;
chai.use(sinonChai);


describe('CmBaseViolation test', () => {
    describe('Constructor', () => {

        it('test empty to string', () => {

            const violation = new BaseViolation();
            expect(violation.toString()).to.be.equal(undefined);
        });

    });

});

