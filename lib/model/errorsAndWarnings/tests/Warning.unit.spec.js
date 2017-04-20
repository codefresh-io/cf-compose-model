'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Warning   = require('./../Warnings/Warning');
const expect    = chai.expect;
chai.use(sinonChai);

describe('Test warnings', () => {
    it('Should format warnings', () => {
        const warning = new Warning('WARNINGS', 'some data or string', 'some data or string', 'clear message');
        expect(warning.format()).to.be.deep.equal({
            "actual": "some data or string",
            "autoFix": false,
            "displayName": "",
            "message": "clear message",
            "name": "WARNINGS",
            "requireManuallyFix": false,
            "suggestion": "some data or string",
        });
    });
});


