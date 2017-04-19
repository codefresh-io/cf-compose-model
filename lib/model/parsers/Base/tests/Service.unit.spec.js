'use strict';

const chai                   = require('chai');
const sinonChai              = require('sinon-chai');
const Service                = require('./../Service');
const expect                 = chai.expect;
chai.use(sinonChai);

describe('Base Service parser', () => {
    describe('_actOnSpecialField', () => {
        it('Should throw an error', () => {
            try {
                new Service('some-name', {})._actOnSpecialField();
            } catch(err){
                expect(err.message).to.be.equal('Should be implemented by sub-classes');
            }
        });
    });
});