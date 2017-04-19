'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Error   = require('./../FieldNotSupportedByOriginalParser'); // jshint ignore:line
const expect    = chai.expect;
chai.use(sinonChai);

describe('Test warnings', () => {
    it('Should get field name', () => {
        expect(new Error('some-name', 'some-value', 'message').getFieldName()).to.be.deep.equal('some-name');
    });
});


