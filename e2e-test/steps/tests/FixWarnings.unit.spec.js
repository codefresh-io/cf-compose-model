'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');
const FixWarnings  = require('./../FixWarnings');
const path         = require('path');
const ComposeModel = require('./../../../').ComposeModel;

const expect = chai.expect;
chai.use(sinonChai);

describe('Fix-Warnings steps testing', () => {
    it('Should have type', () => {
        const step = new FixWarnings();
        expect(step.getType()).to.be.equal('fix-warnings');
    });
    const tests = [
        {
            title: 'Should fix the warnings',
            step: {
                result: [
                    {
                        "actual": "./app\n/app",
                        "autoFix": false,
                        "displayName": "volumes",
                        "message": "Warning: at service os.volumes",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": true,
                        "suggestion": "Volume mapping is not supported, try use: /app"
                    }
                ]
            },
            then: (result) => {
                expect(result).to.be.an.instanceof(ComposeModel);
            },
            file: './docker-compose.success.yml'
        }, {
            title: 'Should fix the warnings without checking the result',
            step: {},
            then: (result) => {
                expect(result).to.be.an.instanceof(ComposeModel);
            },
            file: './docker-compose.success.yml'
        }
    ];

    tests.map(test => {
        it(test.title, () => {
            const step = new FixWarnings();
            return ComposeModel.load(path.resolve(__dirname, test.file))
                .then(step.exec(test.step))
                .then(test.then)
                .catch(test.catch);
        });
    });

    it('Should throw an error when the step invoke without composeModel', () => {
        return new FixWarnings().exec({})()
            .catch((err) => {
                expect(err.message).to.be.equal('Not invoked with ComposeModel instance');
            });
    });

    it('Should test when result passed as string empty', () => {
        const step = new FixWarnings();
        return ComposeModel.parse({
            os: {
                image: 'ubuntu'
            }
        })
            .then(step.exec({
                result: 'empty'
            }))
            .then(result => {
                expect(result).to.be.an.instanceof(ComposeModel);
            })
            .catch((err) => {
                throw err;
            });
    });

});