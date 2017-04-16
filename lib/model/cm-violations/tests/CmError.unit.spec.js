'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const CmError    = require('../CmError');

const expect = chai.expect;
chai.use(sinonChai);


describe('CmError test', () => {
    describe('Constructor', () => {

        it('test empty to string', () => {

            const violation = new CmError();
            expect(violation.toString()).to.be.equal(undefined);
        });

    });

});

