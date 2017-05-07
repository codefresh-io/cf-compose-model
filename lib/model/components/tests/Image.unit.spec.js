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

    });

    describe('Build manually', () => {
        it('Using setters', () => {
            const image = new Image()
                .setRepo('repo')
                .setTag('v1');

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

