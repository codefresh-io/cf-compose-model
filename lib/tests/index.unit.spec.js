'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

describe('First test', () => {
    it('Should success', () => {
        expect(true).to.be.equal(true);
    });

    it('Should load the module', () => {
        const cm = require('./../../');
        expect(cm).to.have.keys([
            "ComposeModel",
            "components",
            "policies",
            "translators"
        ]);
    });

    it('Should load the lib', () => {
        const cm = require('./../');
        expect(cm).to.have.keys([
            "ComposeModel",
            "components",
            "policies",
            "translators"
        ]);
    });

    it('Should load the model', () => {
        const cm = require('./../model');
        expect(cm).to.have.keys([
            "CFComposeModel",
            "components",
            "parsers",
            "policies"
        ]);
    });
});