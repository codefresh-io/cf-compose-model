const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Port     = require('./../Port');
const policies  = require('./../../policies');


const expect = chai.expect;
chai.use(sinonChai);


describe('Port testing', () => {

    describe('Parser', () => {

        it('Parsing single value without mapping', () => {
            const port = Port.parse('3000');
            expect(port.getTarget()).to.be.equal('3000');
            expect(port.getSource()).to.be.equal(undefined);
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing range value 3000-3005', () => {
            const port = Port.parse('3000-3005');
            expect(port.getTarget()).to.be.equal('3000-3005');
            expect(port.getSource()).to.be.equal(undefined);
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping of ports 8000:8000', () => {
            const port = Port.parse('8000:8000');
            expect(port.getTarget()).to.be.equal('8000');
            expect(port.getSource()).to.be.equal('8000');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping range of ports 9090-9091:8080-8081', () => {
            const port = Port.parse('9090-9091:8080-8081');
            expect(port.getTarget()).to.be.equal('8080-8081');
            expect(port.getSource()).to.be.equal('9090-9091');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping ip:port to port 127.0.0.1:8001:8001', () => {
            const port = Port.parse('127.0.0.1:8001:8001');
            expect(port.getSource()).to.be.equal('127.0.0.1:8001');
            expect(port.getTarget()).to.be.equal('8001');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping ip:range of ports to range of ports 127.0.0.1:5000-5010:5000-5010', () => {
            const port = Port.parse('127.0.0.1:5000-5010:5000-5010');
            expect(port.getSource()).to.be.equal('127.0.0.1:5000-5010');
            expect(port.getTarget()).to.be.equal('5000-5010');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping ports with protocol 6060:6060/udp', () => {
            const port = Port.parse('6060:6060/udp');
            expect(port.getSource()).to.be.equal('6060');
            expect(port.getTarget()).to.be.equal('6060');
            expect(port.getProtocol()).to.be.equal('udp');
        });


    });

    describe('Warnings and fix', () => {
        it('Should get warning related to port mapping on shared policy', () => {
            const port = Port.parse('3000:3000');
            expect(port.getWarnings(policies.shared.services['ports'])).to.be.deep.equal([
                {
                    "actual": "3000:3000 ",
                    "autoFix": false,
                    "message": undefined,
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": false,
                    "suggestion": "3000"
                }
            ]);
            port.fixWarnings();
            expect(port.getWarnings(policies.shared.services['ports'])).to.be.deep.equal([]);
        });
    });

});

