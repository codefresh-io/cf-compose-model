'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('../../CFComposeModel');
const YAML           = require('yamljs');
const path           = require('path');

const expect = chai.expect;
chai.use(sinonChai);

const filePath = path.join(__dirname, '..', '..', 'tests', 'ComposeV2', 'ex2.yaml');

describe('Compose V2 parser tests', () => {
    let compose;
    beforeEach(() => {
        compose = CFComposeModel.load(filePath);
    });

    it('Should find all services in yaml', () => {
        expect(compose.services).to.have.keys(['web','redis']);
        expect(compose.services['web'].toJson()).to.have.keys(['image', 'networks']);
        expect(compose.services['redis'].toJson()).to.have.keys(['image', 'volumes', 'networks']);

    });

    it('Should find all volumes in yaml', () => {
        expect(compose.volumes).to.have.keys(['redis-data']);
    });

    it('Should find all networkds in yaml', () => {
        expect(compose.networks).to.have.keys(['front', 'back']);
    });
});
