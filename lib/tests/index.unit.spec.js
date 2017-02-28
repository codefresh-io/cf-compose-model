const chai        = require('chai');
const sinonChai   = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);


describe('First test', () => {
    it('Should success', () => {
        expect(true).to.be.equal(true);
    });
});