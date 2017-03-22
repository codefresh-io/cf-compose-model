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

describe('Compose V2 parser tests', () => {
    it('Should find all services in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllServices()).to.have.keys(['web', 'redis']);
                expect(compose.getServiceByName('web'))
                    .to
                    .have
                    .keys(['_metadata', 'image', 'networks', '_name', 'warnings']);
                expect(compose.getServiceByName('redis'))
                    .to
                    .have
                    .keys(['_metadata', 'image', 'volumes', 'networks', '_volumesType', '_name', 'warnings']);
            });
    });

    it('Should find all volumes in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllVolumes()).to.have.keys(['redis-data', 'mongo-data']);
            });
    });

    it('Should find all networkds in yaml', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
                expect(compose.getAllNetworks()).to.have.keys(['front', 'back']);
            });
    });

    it('Should validate leafs and nodes on compose after parser', () => {
        return CFComposeModel.load(filePath)
            .then(compose => {
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
    });

});
