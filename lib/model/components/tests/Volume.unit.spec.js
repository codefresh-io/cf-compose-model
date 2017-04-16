'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume    = require('../service/Volume');

const expect = chai.expect;
chai.use(sinonChai);


describe('Volume testing', () => {
    describe('Parser and to string', () => {

        it('Parse without mapping', () => {
            const path   = '/var/lib/mysql';
            const volume = new Volume(path);
            expect(volume.getTarget()).to.be.equal('/var/lib/mysql');
            expect(volume.getSource()).to.be.equal(undefined);
            expect(volume.getAccessMode()).to.be.equal(undefined);
        });

        it('Parse with mapping', () => {
            const path   = '/opt/data:/var/lib/mysql';
            const volume = new Volume(path);
            expect(volume.getTarget()).to.be.equal('/var/lib/mysql');
            expect(volume.getSource()).to.be.equal('/opt/data');
            expect(volume.getAccessMode()).to.be.equal(undefined);
        });

        it('Parse with mapping and access mode', () => {
            const path   = '~/configs:/etc/configs/:ro';
            const volume = new Volume(path);
            expect(volume.getTarget()).to.be.equal('/etc/configs/');
            expect(volume.getSource()).to.be.equal('~/configs');
            expect(volume.getAccessMode()).to.be.equal('ro');
        });


    });

    describe('Set Driver', () => {

        it('Parse without mapping', () => {
            const path   = '/var/lib/mysql';
            const volume = new Volume(path);
            expect(volume.getTarget()).to.be.equal('/var/lib/mysql');
            expect(volume.getSource()).to.be.equal(undefined);
            expect(volume.getAccessMode()).to.be.equal(undefined);
        });

    });

    describe('Warnings', () => {
        it('Get all', () => {
            const path   = '/opt/data:/var/lib/mysql';
            const volume = new Volume(path);
            return volume.getWarnings(false, {allowedVolumes: []})
                .then((warnings) => {
                    expect(warnings[0].format()).to.be.deep.equal(
                        {
                            "actual": "/opt/data\n/var/lib/mysql",
                            "autoFix": false,
                            "displayName": "volumes",
                            "message": "",
                            "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                            "requireManuallyFix": true,
                            "suggestion": "Volume mapping is not supported, try use: /var/lib/mysql"
                        }
                    );
                });

        });

    });

    describe('Errors', () => {

        describe('Type validation on init', () => {
            it('With integer', () => {
                try {
                    new Volume(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });

            it('With object', () => {
                try {
                    new Volume(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });

            it('With array', () => {
                try {
                    new Volume(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });
        });

        describe('Setting data', () => {
            let volume;
            beforeEach(() => {
                volume = new Volume();
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
                title: 'setAccessMode',
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
                                volume[cat.title](test.invokeWith);
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

