const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Port     = require('./../Port');

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

        it('Parsing mapping of ports 8000:8000', () => {
            const port = Port.parsePort('8000:8000');
            expect(port.target).to.be.equal('8000');
            expect(port.source).to.be.equal('8000');
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing mapping range of ports 9090-9091:8080-8081', () => {
            const port = Port.parsePort('9090-9091:8080-8081');
            expect(port.target).to.be.equal('8080-8081');
            expect(port.source).to.be.equal('9090-9091');
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing mapping ip:port to port 127.0.0.1:8001:8001', () => {
            const port = Port.parsePort('127.0.0.1:8001:8001');
            expect(port.source).to.be.equal('127.0.0.1:8001');
            expect(port.target).to.be.equal('8001');
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing mapping ip:range of ports to range of ports 127.0.0.1:5000-5010:5000-5010', () => {
            const port = Port.parsePort('127.0.0.1:5000-5010:5000-5010');
            expect(port.source).to.be.equal('127.0.0.1:5000-5010');
            expect(port.target).to.be.equal('5000-5010');
            expect(port.protocol).to.be.equal(undefined);
        });

        it('Parsing mapping ports with protocol 6060:6060/udp', () => {
            const port = Port.parsePort('6060:6060/udp');
            expect(port.source).to.be.equal('6060');
            expect(port.target).to.be.equal('6060');
            expect(port.protocol).to.be.equal('udp');
        });


    });

});

