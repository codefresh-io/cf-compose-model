'use strict';

const fs             = require('fs');
const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const expect         = chai.expect; // jshint ignore:line
const _              = require('lodash');
const typeValidation = require('./../typeValidation');

chai.use(sinonChai);

describe('typeValidation tests', () => {
    describe('regexMatch', () => {
        it('when regex is not RegExp instance', () => {
            expect(typeValidation.regexMatch('to test', 'to')).to.be.equal(true);
        });
    });
});