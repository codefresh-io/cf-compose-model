const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Port      = require('../service/Port');
const expect    = chai.expect;
chai.use(sinonChai);


describe('Port testing', () => {

    describe('Parser', () => {

        it('Parsing single value without mapping', () => {
            const port = new Port('3000');
            expect(port.getTarget()).to.be.equal('3000');
            expect(port.getSource()).to.be.equal(undefined);
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing range value 3000-3005', () => {
            const port = new Port('3000-3005');
            expect(port.getTarget()).to.be.equal('3000-3005');
            expect(port.getSource()).to.be.equal(undefined);
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping of ports 8000:8000', () => {
            const port = new Port('8000:8000');
            expect(port.getTarget()).to.be.equal('8000');
            expect(port.getSource()).to.be.equal('8000');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping range of ports 9090-9091:8080-8081', () => {
            const port = new Port('9090-9091:8080-8081');
            expect(port.getTarget()).to.be.equal('8080-8081');
            expect(port.getSource()).to.be.equal('9090-9091');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping ip:port to port 127.0.0.1:8001:8001', () => {
            const port = new Port('127.0.0.1:8001:8001');
            expect(port.getSource()).to.be.equal('127.0.0.1:8001');
            expect(port.getTarget()).to.be.equal('8001');
            expect(port.getProtocol()).to.be.equal(undefined);
        });

        it('Parsing mapping ip:range of ports to range of ports 127.0.0.1:5000-5010:5000-5010',
            () => {
                const port = new Port('127.0.0.1:5000-5010:5000-5010');
                expect(port.getSource()).to.be.equal('127.0.0.1:5000-5010');
                expect(port.getTarget()).to.be.equal('5000-5010');
                expect(port.getProtocol()).to.be.equal(undefined);
            });

        it('Parsing mapping ports with protocol 6060:6060/udp', () => {
            const port = new Port('6060:6060/udp');
            expect(port.getSource()).to.be.equal('6060');
            expect(port.getTarget()).to.be.equal('6060');
            expect(port.getProtocol()).to.be.equal('udp');
        });


    });

    describe('Warnings and fix', () => {
        it('Should get warning related to port mapping on shared policy', () => {
            const port = new Port('3000:3000');
            expect(port.getWarnings(false)[0].format()).to.be.deep.equal({
                "actual": "ports\n3000:3000 ",
                "autoFix": false,
                "displayName": "",
                "message": "",
                "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                "requireManuallyFix": false,
                "suggestion": "Avoid using port mapping, try use 3000"
            });
            port.fixWarnings();
            expect(port.getWarnings(false)).to.be.deep.equal([]);
        });
    });

    describe('Errors', () => {

        describe('Type validation on init', () => {
            it('With object', () => {
                try {
                    new Port({});
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });

            it('With array', () => {
                try {
                    new Port([]);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });
        });

        describe('Setting data', () => {
            let port;
            beforeEach(() => {
                port = new Port();
            });

            const ds = [{
                title: 'setSource',
                tests: [{
                    title: 'With undefined',
                    invokeWith: undefined
                }, {
                    title: 'With array',
                    invokeWith: []
                }, {
                    title: 'With object',
                    invokeWith: {}
                }
                ]
            }, {
                title: 'setTarget',
                tests: [{
                    title: 'With undefined',
                    invokeWith: undefined
                }, {
                    title: 'With array',
                    invokeWith: []
                }, {
                    title: 'With object',
                    invokeWith: {}
                }
                ]
            }, {
                title: 'setProtocol',
                tests: [{
                    title: 'With undefined',
                    invokeWith: undefined
                }, {
                    title: 'With integer',
                    invokeWith: 1
                }, {
                    title: 'With array',
                    invokeWith: []
                }, {
                    title: 'With object',
                    invokeWith: {}
                }
                ]
            }
            ];

            ds.map(cat => {
                describe(`Testing ${cat.title}`, () => {
                    cat.tests.map(test => {
                        it(`${test.title}`, () => {
                            try {
                                port[cat.title](test.invokeWith);
                                throw new Error('');
                            } catch (err) {
                                expect(err.message).to.be.equal('TYPE_NOT_MATCH');
                            }
                        });
                    });
                });
            });

        });

    });

});

