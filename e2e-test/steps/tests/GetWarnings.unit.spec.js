'use strict';

const chai          = require('chai');
const sinonChai     = require('sinon-chai');
const GetWarnings = require('./../GetWarnings');
const path          = require('path');
const ComposeModel  = require('./../../../').ComposeModel;

const expect = chai.expect;
chai.use(sinonChai);

describe('Get-Warnings steps testing', () => {
    it('Should have type', () => {
        const step = new GetWarnings();
        expect(step.getType()).to.be.equal('get-warnings');
    });
    const tests = [
        {
            title: 'Should get the warnings',
            step: {
                result: [
                    {
                        "actual": "ports\n80:80",
                        "autoFix": false,
                        "displayName": "ports",
                        "message": "Warning: at service os.ports",
                        "name": "FIELD_NOT_SUPPORTED_IN_POLICY",
                        "requireManuallyFix": false,
                        "suggestion": "Port mapping not supported, try use 80"
                    },
                    {
                        "actual": "/app\n/app",
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
        },         {
            title: 'Should get the warnings without testing the result',
            step: {},
            then: (result) => {
                expect(result).to.be.an.instanceof(ComposeModel);
            },
            file: './docker-compose.success.yml'
        }
    ];

    tests.map(test => {
        it(test.title, () => {
            const step = new GetWarnings();
            return ComposeModel.load(path.resolve(__dirname, test.file))
                .then(step.exec(test.step))
                .then(test.then)
                .catch(test.catch);
        });
    });

    it('Should throw an error when the step invoke without composeModel', () => {
        return new GetWarnings().exec({})()
            .catch((err) => {
                expect(err.message).to.be.equal('Not invoked with ComposeModel instance');
            });
    });

    it('Should test when result passed as string empty', () => {
        const step = new GetWarnings();
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
            .catch(() => {
                throw new Error('');
            });
    });

});