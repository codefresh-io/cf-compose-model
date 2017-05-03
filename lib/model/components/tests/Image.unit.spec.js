'use strict';

const chai                 = require('chai');
const sinonChai            = require('sinon-chai');
const Image                = require('../service/Image');
const ServiceAccessibility = require('./../../accessibility').ServiceAccessibility;
const serviceAccessibility = new ServiceAccessibility();

const expect = chai.expect;
chai.use(sinonChai);


describe('Image testing', () => {

    describe('Parser', () => {

        it('Should parse only image name', () => {
            const image = new Image('redis');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal(undefined);
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner', () => {
            const image = new Image('tutum/redis');
            expect(image.getRepo()).to.be.equal('tutum/redis');
            expect(image.getTag()).to.be.equal(undefined);
        });

        it('Should parse image with tag', () => {
            const image = new Image('redis:0.1');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal('0.1');
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner and tag', () => {
            const image = new Image('tutum/redis:0.1');
            expect(image.getRepo()).to.be.equal('tutum/redis');
            expect(image.getTag()).to.be.equal('0.1');
        });

        it('Should parse image with registry and repo name', () => {
            const imageString = 'example-registry.com:4000/postgresql';
            const image       = new Image(imageString);

            expect(image.getRepo()).to.be.equal('example-registry.com:4000/postgresql');
        });

        it('Should parse image with special chars', () => {
            const imageString = 'express-app-container:latest';
            const image       = new Image(imageString);
            expect(image.getRepo()).to.be.equal('express-app-container');
            expect(image.getTag()).to.be.equal('latest');
        });

        it('Should parse image nam with registry, port, ful name and tag', () => {
            const imageRawName = 'docker.io:5878/imagenamepart1/part2/part3:sometag';
            const image        = new Image(imageRawName);
            expect(image.getRepo()).to.be.deep.equal('docker.io:5878/imagenamepart1/part2/part3');
            expect(image.getTag()).to.be.deep.equal('sometag');
            expect(image.getName()).to.be.deep.equal(imageRawName);
        });

        const dnsHostNames = [
            {
                title: 'Name includes dns with port',
                raw: 'example-registry.com:4000/postgresql',
                expected: true
            }, {
                title: 'Name includes just dns ',
                raw: 'example-registry.com/postgresql',
                expected: false
            }
        ];

        dnsHostNames.map(dns => {
            it(dns.title, () => {
                const image = new Image(dns.raw);
                expect(image._includingDnsWithPort(dns.raw)).to.be.equal(dns.expected);
            });
        });

    });

    describe('Warnings and fixes', () => {
        it('Should get warnings related to the owner and the tag', () => {
            const image = new Image('redis');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });

        it('Should fix warnings related to the tag', () => {
            const image = new Image('redis');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]
            );
            image.fixWarnings();
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });
    });

    describe('Warning', () => {
        it('Should get all warnings for image with only image name', () => {
            const image = new Image('redis');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });

        it('Should get all warnings for image with image name and tag', () => {
            const image = new Image('redis:0.1');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });

        it('Should get all warnings for image with image name and owner', () => {
            const image = new Image('tutum/redis');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });

        it('Should get zero warnings when all params exist', () => {
            const image = new Image('tutum/redis:0.1');
            expect(image.getWarnings(serviceAccessibility)).to.be.deep.equal([]);
        });

        it('Should get warning when missing tag is reproduce warning', () => {
            const image    = new Image('docker/compose');
            const warnings = image.getWarnings({
                isMissingTagReproduceWarning: () => {return true;}
            });
            expect(warnings).to.be.deep.equal([
                {
                    "_actual": "docker/compose\ndocker/compose",
                    "_autoFix": true,
                    "_fieldName": "docker/compose",
                    "_fieldValue": "docker/compose",
                    "_message": "Add tag",
                    "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                    "_suggestion": "docker:compose"
                }
            ]);
        });

        it('Should get warning when missing owner is reproduce warning', () => {
            const image    = new Image('compose');
            const warnings = image.getWarnings({
                isMissingOwnerReproduceWarning: () => {return true;},
                isMissingTagReproduceWarning: () => {return false;}
            });
            expect(warnings).to.be.deep.equal([
                {
                    "_actual": "compose\ncompose",
                    "_fieldName": "compose",
                    "_fieldValue": "compose",
                    "_message": "",
                    "_name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                    "_suggestion": "compose"
                }
            ]);
        });

    });

    describe('Build manually', () => {
        it('Using setters', () => {
            const image = new Image()
                .setRepo('repo')
                .setOwner('owner')
                .setTag('v1');

            expect(image.getOwner()).to.be.equal('owner');
            expect(image.getRepo()).to.be.equal('repo');
            expect(image.getTag()).to.be.equal('v1');
        });
    });

    describe('Using image class', () => {
        const tests = [{
            title: 'Should get image standard name for ubuntu:14.04',
            input: 'ubuntu:14.04',
            expected: 'ubuntu:14.04',
            function: 'getName'
        }, {
            title: 'Should get image standard name for docker/compose:1.9.0',
            input: 'docker/compose:1.9.0',
            expected: 'docker/compose:1.9.0',
            function: 'getName'
        }, {
            title: 'Should get image standard name for redis',
            input: 'redis',
            expected: 'redis',
            function: 'getName'
        }
        ];

        tests.map(test => {
            it(test.title, () => {
                const image = new Image(test.input);
                expect(image[test.function]()).to.be.equal(test.expected);
            });
        });
    });

    describe('Errors', () => {

        describe('Type validation on init', () => {
            it('With integer', () => {
                try {
                    new Image(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });

            it('With object', () => {
                try {
                    new Image(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });

            it('With array', () => {
                try {
                    new Image(123);
                } catch (err) {
                    expect(err.message).to.be.deep.equal('TYPE_NOT_MATCH');
                }
            });
        });

        describe('Setting data', () => {
            let image;
            beforeEach(() => {
                image = new Image();
            });

            const ds = [
                {
                    title: 'setOwner',
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
                },
                {
                    title: 'setTag',
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
                },
                {
                    title: 'setRepo',
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
                                image[cat.title](test.invokeWith);
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

