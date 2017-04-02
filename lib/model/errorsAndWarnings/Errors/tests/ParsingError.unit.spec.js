'use strict';

const chai         = require('chai');
const sinonChai    = require('sinon-chai');
const ParsingError = require('./../ParsingError');
const expect       = chai.expect; // jshint ignore:line
chai.use(sinonChai);

describe('Parsing error tesing', () => {
    it('Should stringify using to string', () => {
        const err = new ParsingError('Parsing yaml failed');
        err.errors = [];
        err.warnings = [];
    });
});


