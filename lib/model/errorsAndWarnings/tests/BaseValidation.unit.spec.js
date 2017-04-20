'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const BaseValidation = require('./../BaseValidation');
const expect         = chai.expect;
chai.use(sinonChai);

describe('Test base validation', () => {
    it('Should init class ', () => {
        expect(new BaseValidation()).to.be.an.instanceof(BaseValidation);
    });

    it('Should use getter and setters', () => {
        const validation = new BaseValidation('SOME_NAME', 'some message');
        expect(validation.getName()).to.be.equal('SOME_NAME');
        expect(validation.getMessage()).to.be.equal('some message');
    });

    it('Should throw an error when calling format that is not implemented', () => {
        try{
            new BaseValidation().format();
        } catch(err){
            expect(err.message).to.be.deep.equal('Not implemented');
        }
    });
});



