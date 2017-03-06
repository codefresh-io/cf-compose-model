const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume     = require('./../Volume');
const policies  = require('./../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Volume testing', () => {
    it('', () => {
        const volume = new Volume('../:path');
        const warnings = volume.getWarnings(policies.shared.services);
        expect(warnings[0].name).to.be.equal('NO_PERMISSION');
    });
});

