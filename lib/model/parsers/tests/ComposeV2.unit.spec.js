'use strict';

const _              = require('lodash');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');
const path           = require('path');
const BaseComponent  = require('./../../components/Base');

const expect = chai.expect;
chai.use(sinonChai);

const filePath = path.join(__dirname, '..', '..', 'tests', 'ComposeV2', 'ex2.yaml');

function getPath(name) {
    return path.resolve(__dirname, `./yamls/ComposeV2/${name}.yaml`);
}


describe('Compose V2 parser tests', () => {
    let compose;
    beforeEach(() => {
        compose = CFComposeModel.load(filePath);
    });

    it('Should find all services in yaml', () => {
        expect(compose.getAllServices()).to.have.keys(['web', 'redis']);
        expect(compose.getAllServices()['web'].toJson()).to.have.keys(['image', 'networks']);
        expect(compose.getAllServices()['redis'].toJson())
            .to
            .have
            .keys(['image', 'volumes', 'networks']);
    });

    it('Should find all volumes in yaml', () => {
        expect(compose.getAllVolumes()).to.have.keys(['redis-data']);
    });

    it('Should find all networkds in yaml', () => {
        expect(compose.getAllNetworks()).to.have.keys(['front', 'back']);
    });

    it('Should validate leafs and nodes on compose after parser', () => {
        _.forOwn(compose.getAllServices(), (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(BaseComponent);
            expect(cfNodeInstance['image']).to.be.instanceOf(BaseComponent);
        });
        _.forOwn(compose.getAllVolumes(), (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(BaseComponent);
        });
        _.forOwn(compose.getAllNetworks(), (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(BaseComponent);
        });
    });

    describe('Should throw errors', () => {

        function loadAndExpectToErrorMessage(location, errorMessage) {
            try {
                CFComposeModel.load(location);
                throw new Error(`Error must be thrown from the parser with ${errorMessage}`);
            } catch (err) {
                expect(err.message).to.be.deep.equal(errorMessage);
            }
        }

        describe('Service', () => {

            const tests = [{
                filePath: 'ex1.image',
                errorMessageExpected: 'Image must be a string',
                title: 'image passing is not a string'
            }, {
                filePath: 'ex2.ports',
                errorMessageExpected: 'Ports must be array or object',
                title: 'ports passing not object or array'
            }, {
                filePath: 'ex3.volumes',
                errorMessageExpected: 'Volumes must be array or object',
                title: 'volumes passing not object or array'
            }, {
                filePath: 'ex4.services.unsupported',
                errorMessageExpected: `Field 'not_compose_field' not supported by compose v2 under services`,
                title: 'not supported fields in services by compose passing'
            }, {
                filePath: 'ex5.volumes.unsupported',
                errorMessageExpected: `Field 'not_compose_field' not supported by compose v2 under volumes`,
                title: 'not supported fields in volumes by compose passing',
            }, {
                filePath: 'ex6.networks.unsupported',
                errorMessageExpected: `Field 'not_compose_field' not supported by compose v2 under networks`,
                title: 'not supported fields in networks by compose passing'
            }
            ];

            tests.map(test => {
                if(test.only){
                    it.only(`Should throw and error when  ${test.title}`, () => {
                        const location = getPath(test.filePath);
                        loadAndExpectToErrorMessage(location, test.errorMessageExpected);
                    });
                } else {
                    it(`Should throw and error when  ${test.title}`, () => {
                        const location = getPath(test.filePath);
                        loadAndExpectToErrorMessage(location, test.errorMessageExpected);
                    });
                }
            });

        });

        describe('Volumes', () => {
            it('', () => {

            });
        });

        describe('Networkds', () => {

        });
    });

});
