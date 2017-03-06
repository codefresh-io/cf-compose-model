const chai      = require('chai');
const sinonChai = require('sinon-chai');
const ContainerName     = require('./../ContainerName');
const policies  = require('./../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('ContainerName testing', () => {
    it('', () => {
        const containerName = new ContainerName('.');
        const warnings = containerName.getWarnings(policies.shared.services);
        expect(warnings[0].name).to.be.equal('NOT_SUPPORTED');
    });
});

