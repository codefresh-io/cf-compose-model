'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Error   = require('./../Errors/Error'); // jshint ignore:line
const expect    = chai.expect;
chai.use(sinonChai);

describe('Test warnings', () => {
    it('Should format warnings', () => {
        const warning = new Error('WARNINGS', 'some data or string', 'some data or string', 'clear message');
        expect(warning.format()).to.be.deep.equal({
            "data": "some data or string",
            "message": "some data or string",
            "name": "WARNINGS"
        });
    });
});


