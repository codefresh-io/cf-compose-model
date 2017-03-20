'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');
const path         = require('path');
const ComposeModel = require('./../../CFComposeModel');

const expect = chai.expect;
chai.use(sinonChai);

function loadComposeFromLocationAndLoad(file) {
    const location = path.resolve(__dirname, file);
    return ComposeModel.load(location);
}

describe('Yaml parsing', () => {
    describe('Errors', () => {
        const parsers = ['ComposeV1', 'ComposeV2'];
        const tests = [
            {
            path: 'image',
            title: 'Should detect image is not string',
            expect: [
                {
                    "actual": [
                        {
                            "name": "name"
                        }
                    ],
                    "autoFix": false,
                    "message": "Image must be string, got Array",
                    "name": "image",
                    "requireManuallyFix": true,
                }
            ],
            parsers: parsers
        }, {
            path: 'ports',
            title: 'Should detect that port been passed as string instead of array or object',
            expect: [
                {
                    "actual": 8080,
                    "autoFix": false,
                    "message": "Ports must be array or object, got number",
                    "name": "ports",
                    "requireManuallyFix": true
                },
                {
                    "actual": "2376",
                    "autoFix": false,
                    "message": "Ports must be array or object, got string",
                    "name": "ports",
                    "requireManuallyFix": true
                }
            ],
            parsers: parsers

        }, {
            path: 'volumes',
            title: 'Should detect that volume been passed as string instead of array or object',
            expect: [
                {
                    "actual": "/app",
                    "autoFix": false,
                    "message": "Volumes must be array or object, got string",
                    "name": "volumes",
                    "requireManuallyFix": true
                }
            ],
            parsers: parsers
        }, {
            path: 'not-supported',
            title: 'Should detect the field is unsupported for compose v1',
            expect: [
                {
                    "actual": true,
                    "autoFix": false,
                    "message": "Field 'not_supported' is not supported by compose v1",
                    "name": "not_supported",
                    "requireManuallyFix": true
                }
            ],
            parsers: [parsers[0]]
        }, {
                path: 'not-supported-services',
                title: 'Should detect the field is unsupported for compose v1',
                expect: [
                    {
                        "actual": true,
                        "autoFix": false,
                        "message": "Field 'not_supported' is not supported by compose v2 under services",
                        "name": "not_supported",
                        "requireManuallyFix": true
                    }
                ],
                parsers: [parsers[1]]
            }, {
                path: 'not-supported-networks',
                title: 'Should detect the field is unsupported for compose v1',
                expect: [],
                parsers: [parsers[1]]
            }, {
                path: 'not-supported-volumes',
                title: 'Should detect the field is unsupported for compose v1',
                expect: [],
                parsers: [parsers[1]]
            }];
        tests.map((test) => {
            test.parsers.map((Parser) => {
                it(`${test.title} for parser ${Parser}`, () => {
                    return loadComposeFromLocationAndLoad(`./yamls/${Parser}/WithErrors/${test.path}.yaml`)
                        .then(compose => {
                            return compose.getErrors();
                        })
                        .then((errors) => {
                            expect(errors).to.be.deep.equal(test.expect);
                        });
                });

            });
        });

    });
});
