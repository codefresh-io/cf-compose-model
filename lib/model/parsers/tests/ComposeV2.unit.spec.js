'use strict';

const _              = require('lodash');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');
const YAML           = require('yamljs');
const path           = require('path');
const baseClasses    = require('./../../components/base');

const expect = chai.expect;
chai.use(sinonChai);

const filePath = path.join(__dirname, '..', '..', 'tests', 'ComposeV2', 'ex2.yaml');

describe('Compose V2 parser tests', () => {
    let compose;
    beforeEach(() => {
        compose = CFComposeModel.load(filePath);
    });

    it('Should find all services in yaml', () => {
        expect(compose.services).to.have.keys(['web', 'redis']);
        expect(compose.services['web'].toJson()).to.have.keys(['image', 'networks']);
        expect(compose.services['redis'].toJson()).to.have.keys(['image', 'volumes', 'networks']);
    });

    it('Should find all volumes in yaml', () => {
        expect(compose.volumes).to.have.keys(['redis-data']);
    });

    it('Should find all networkds in yaml', () => {
        expect(compose.networks).to.have.keys(['front', 'back']);
    });

    it('Should validate leafs and nodes on compose after parser', () => {
        _.forOwn(compose.services, (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(baseClasses.CFNode);
            expect(cfNodeInstance['image']).to.be.instanceOf(baseClasses.CFLeaf);
        });
        _.forOwn(compose.volumes, (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(baseClasses.CFNode);
        });
        _.forOwn(compose.networks, (cfNodeInstance) => {
            expect(cfNodeInstance).to.be.instanceOf(baseClasses.CFNode);
        });
    });
});
