'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const expect         = chai.expect; // jshint ignore:line
const typeValidation = require('./../typeValidation');

chai.use(sinonChai);

describe('typeValidation tests', () => {
    describe('regexMatch', () => {
        it('when regex is not RegExp instance', () => {
            expect(typeValidation.regexMatch('to test', 'to')).to.be.equal(true);
        });
    });
});