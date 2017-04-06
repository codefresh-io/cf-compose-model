'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const YamlNotSuppliedError   = require('./../YamlNotSuppliedError');
const expect    = chai.expect;
chai.use(sinonChai);

describe('YamlNotSupplied testing', () => {
    it('Should be Error', () => {
        expect(new YamlNotSuppliedError()).to.be.an.instanceof(Error);
    });

    it('Should have message', () => {
        expect(new YamlNotSuppliedError().message).to.be.equal('YAML_NOT_SUPPLIED');
    });

    it('Should return string', () => {
        expect(new YamlNotSuppliedError().toString()).to.be.equal('Error: YAML_NOT_SUPPLIED');
    });
});

