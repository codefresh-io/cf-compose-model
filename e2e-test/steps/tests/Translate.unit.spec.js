'use strict';

const chai          = require('chai');
const sinonChai     = require('sinon-chai');
const TranslateStep = require('./../Translate');
const path          = require('path');
const ComposeModel  = require('./../../../').ComposeModel;

const expect = chai.expect;
chai.use(sinonChai);

describe('Translate steps testing', () => {
    it('Should have type', () => {
        const step = new TranslateStep();
        expect(step.getType()).to.be.equal('translate');
    });
    const tests = [
        {
            title: 'Should translate',
            step: {
                result: {
                    os: {
                        image: 'ubuntu',
                        ports: ['80:80'],
                        volumes: ['/app:/app']
                    }
                }
            },
            file: './docker-compose.success.yml'
        }, {
            title: 'Should translate to json',
            step: {
                to: 'json',
                result: `{"os": {"image": "ubuntu","ports": ["80:80"], "volumes": ["/app:/app"]}}`
            },
            file: './docker-compose.success.yml'
        }, {
            title: 'Should throw an error when translating to unsupported type',
            step: {
                to: 'not-supported'
            },
            file: './docker-compose.success.yml',
            catch: (err) => {
                expect(err.message).to.be.equal('Translation method not-supported not supported');
            }
        }
    ];

    tests.map(test => {
        it(test.title, () => {
            const step = new TranslateStep();
            return ComposeModel.load(path.resolve(__dirname, test.file))
                .then(step.exec(test.step))
                .catch(test.catch);

        });
    });

});