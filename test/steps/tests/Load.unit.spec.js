'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const LoadStep  = require('./../Load');

const expect = chai.expect;
chai.use(sinonChai);

describe('Load steps testing', () => {
    it('Should have type', () => {
        const step = new LoadStep();
        expect(step.getType()).to.be.deep.equal('load');
    });

    const tests = [
        {
            title: 'Step has on-fail with message',
            step: {
                'file': './docker-compose.fail.yml',
                'on-fail': {
                    'message': `Error: PARSING_COMPOSE_FAILED\nWith message: Failed to parse compose object\nBased on input:\n\n"os:\\n  image:\\n    - name: 1"`
                }
            }
        }, {
            title: 'Step has on-fail with error-content',
            step: {
                'file': './docker-compose.fail.yml',
                'on-fail': {
                    'errors-content': [
                        {
                            "fieldData": [
                                {
                                    "name": 1
                                }
                            ],
                            "fieldName": "image",
                            "message": "Image must be string, got Array",
                            "requireManuallyFix": true
                        }
                    ]
                }
            }
        }, {
            title: 'Should throw an error when parsing success but on-fail passed',
            step: {
                'file': './docker-compose.success.yml',
                'on-fail': {}
            },
            catch: (err) => {
                expect(err.message)
                    .to
                    .be
                    .equal(
                        'on-fail was defined but the load step was successful, check you file and the flow flow configuration');
            }
        }, {
            title: 'With pro policy',
            step: {
                'file': './docker-compose.success.yml',
                policy: 'pro'
            },
            then: (composeModel) => {
                expect(composeModel.getAllServices()['os'].getImage().getName())
                    .to
                    .be
                    .equal('ubuntu');
            }
        }, {
            title: 'Should load',
            step: {
                'file': './docker-compose.success.yml'
            },
            then: (composeModel) => {
                expect(composeModel.getAllServices()['os'].getImage().getName())
                    .to
                    .be
                    .equal('ubuntu');
            }
        }
    ];

    tests.map(test => {
        it(test.title, () => {
            const step = new LoadStep();
            return step.exec(__dirname)(test.step)
                .catch(test.catch)
                .then(test.then ? test.then : () => {});
        });
    })
});