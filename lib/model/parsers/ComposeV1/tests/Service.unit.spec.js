'use strict';

const chai                   = require('chai');
const sinonChai              = require('sinon-chai');
const ComposeV1ServiceParser = require('./../Service');
const Service                = require('./../../../components/service/Service');
const expect                 = chai.expect;
chai.use(sinonChai);

describe('Compose v1 service parser', () => {
    const tests    = [{
        title: 'Basic parse',
        mockObj: {
            web: {}
        },
        expectedService: new Service('web')
    }, {
        title: 'Should parse with image',
        mockObj: {
            web: {
                image: 'ubuntu'
            }
        },
        expectedService: new Service('web').setImage('ubuntu')
    }, {
        title: 'Should parse with ports as array',
        mockObj: {
            web: {
                ports: ["80:80", "81:81"]
            }
        },
        expectedService: new Service('web').addPort('80:80').addPort('81:81')
    }, {
        title: 'Should parse with environment variables as object',
        mockObj: {
            web: {
                environment: [
                    "key1=val1",
                    "key2=val2"
                ]
            }
        },
        expectedService: new Service('web').addEnvironmentVariable('key1', 'val1').addEnvironmentVariable('key2', 'val2')
    }, {
        title: 'Should parse with environment variables as object',
        mockObj: {
            web: {
                command: ['ls', '-la']
            }
        },
        expectedService: new Service('web').setAdditionalData('command', ['ls', '-la'])
    }];

    tests.map(test => {
        it(test.title, () => {
            const yamlString = test.mockObj.web;
            const composeV1ServiceParser = new ComposeV1ServiceParser('web', yamlString);
            return composeV1ServiceParser.parse()
                .then(service => {
                    expect(service).to.be.deep.equal(test.expectedService);
                });
        });
    })
});