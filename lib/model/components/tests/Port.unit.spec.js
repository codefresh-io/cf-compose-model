const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Port     = require('./../Port');
const policies  = require('./../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Port testing', () => {

    describe('Parser', () => {
        it('Parsing single value without mapping', () => {
            const port = Port.parsePort('3000');
            expect(port.target).to.be.equal('3000');
            expect(port.source).to.be.equal(undefined);
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing range value 3000-3005', () => {
            const port = Port.parsePort('3000-3005');
            expect(port.target).to.be.equal('3000-3005');
            expect(port.source).to.be.equal(undefined);
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing mapping of ports', () => {

        });
    });
});

