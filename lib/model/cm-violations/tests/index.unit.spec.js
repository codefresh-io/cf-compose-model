'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Violations    = require('../index');

const expect = chai.expect;
chai.use(sinonChai);


describe('Violations ', () => {
    describe('Constructor', () => {

        it('construct all violations', () => {


            expect(Violations.CmError()).to.be.equal(undefined);
            expect(Violations.CmInfo()).to.be.equal(undefined);
            expect(Violations.CmBaseViolation()).to.be.equal(undefined);
            expect(Violations.CmWarning()).to.be.equal(undefined);
        });

    });

});

