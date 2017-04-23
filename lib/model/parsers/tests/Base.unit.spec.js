'use strict';

const chai       = require('chai');
const sinonChai  = require('sinon-chai');
const BaseParser = require('./../Base');
const expect     = chai.expect;
chai.use(sinonChai);

describe('Base parser class testing', () => {
    it('Should throw an error when service name is not valie', () => {
        expect(BaseParser.isServiceNameValid('postgras:9.1.4')).to.be.equal(false);

    });
});
