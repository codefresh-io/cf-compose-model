'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const CmWarning    = require('../CmWarning');

const expect = chai.expect;
chai.use(sinonChai);


describe('CmWarning test', () => {
    describe('Constructor', () => {

        it('test empty to string', () => {

            const violation = new CmWarning();
            expect(violation.toString()).to.be.equal(undefined);
        });

    });

});

