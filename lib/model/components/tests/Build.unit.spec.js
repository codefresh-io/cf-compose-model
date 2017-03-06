const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Build     = require('./../Build');
const policies  = require('./../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Build testing', () => {
    it('', () => {
        const build = new Build('.');
        const warnings = build.getWarnings(policies.shared.services);
        expect(warnings[0].name).to.be.equal('NOT_SUPPORTED');
    });
});

