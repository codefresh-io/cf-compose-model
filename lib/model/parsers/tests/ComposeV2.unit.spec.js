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
    let compose;
    beforeEach(() => {
        compose = CFComposeModel.load(filePath);
    });

    it('Should find all services in yaml', () => {
        expect(compose.getAllServices()).to.have.keys(['web', 'redis']);
        expect(compose.getAllServices()['web'].toJson()).to.have.keys(['image', 'networks']);
        expect(compose.getAllServices()['redis'].toJson()).to.have.keys(['image', 'volumes', 'networks']);
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

});
