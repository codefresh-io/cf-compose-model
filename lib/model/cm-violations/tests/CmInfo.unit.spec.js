'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const CmInfo    = require('../CmInfo');

const expect = chai.expect;
chai.use(sinonChai);


describe('CmInfo test', () => {
    describe('Constructor', () => {

        it('test empty to string', () => {

            const violation = new CmInfo();
            expect(violation.toString()).to.be.equal(undefined);
        });

    });

});

