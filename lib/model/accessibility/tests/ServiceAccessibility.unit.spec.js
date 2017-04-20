'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const expect    = chai.expect;
const Accessibility = require('./../ServiceAccessibility');
chai.use(sinonChai);

describe('Service Accessibility testing', () => {

    it('context should not be supported', () => {
        expect(new Accessibility().isContextSupported()).to.be.equal(false);
    });

});

